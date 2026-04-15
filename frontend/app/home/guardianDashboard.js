import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator, SafeAreaView, Platform, StatusBar, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { alzheimerAPI, elderlyAPI } from "../../services/api";

const COLORS = {
  bg: "#0F172A",
  card: "#1E293B",
  primary: "#4338CA",
  accent: "#7C3AED",
  text: "#F1F5F9",
  muted: "#64748B",
  border: "#334155",
  success: "#10B981",
  warning: "#F59E0B"
};

export default function GuardianDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [results, setResults] = useState([]);

  const isElderly = user?.linkedPatientType === "elderly";

  const fetchHealthData = useCallback(async () => {
    if (!user?.linkedPatientId) return;
    setLoading(true);
    try {
      if (isElderly) {
        const [tRes, nRes] = await Promise.all([
          elderlyAPI.tasks.getAll(),
          elderlyAPI.notepad.getAll()
        ]);
        if (tRes.success) setTasks(tRes.data || []);
        if (nRes.success) setNotes(nRes.data || []);
      } else {
        const [tRes, nRes, rRes] = await Promise.all([
          alzheimerAPI.tasks.getAll(),
          alzheimerAPI.notes.getAll(),
          alzheimerAPI.game.getResults()
        ]);
        if (tRes.success) setTasks(tRes.tasks || []);
        if (nRes.success) setNotes(nRes.notes || []);
        if (rRes.success) setResults(rRes.results || []);
      }
    } catch (e) {
      console.error("Guardian fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [user, isElderly]);

  const openHealthInfo = () => {
    setShowHealthModal(true);
    fetchHealthData();
  };

  const featureItems = [
    { icon: "🩺", title: "Find Doctors", sub: "Search by specialization", color: "#1E40AF", route: "home/doctors" },
    { icon: "🌿", title: "Home Remedies", sub: "Natural solutions", color: "#166534", route: "home/remedies" },
    { icon: "🚨", title: "Smart Sensors", sub: "Fall detection & alerts", color: "#DC2626", route: "home/sensors" },
  ];

  const monitoringItems = [
    { 
      icon: "📍", 
      title: "Patient Location", 
      sub: "View live location", 
      color: "#2563EB", 
      action: () => {
        if (!isElderly) router.push("/caregiver?tab=location");
        else Alert.alert("Coming Soon", "Real-time location for elderly care is currently focused on Alzheimer patients.");
      } 
    },
    { 
      icon: "🚨", 
      title: "Alerts", 
      sub: "Notifications & warnings", 
      color: "#DC2626", 
      action: () => {
        if (!isElderly) router.push("/caregiver?tab=alerts");
        else Alert.alert("Coming Soon", "Safety alerts for elderly care are currently focused on Alzheimer patients.");
      } 
    },
    { icon: "❤️", title: "Health Info", sub: "Read-only summary", color: "#7C3AED", action: openHealthInfo },
  ];

  const renderHealthContent = () => {
    if (loading) return <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />;
    
    return (
      <View style={{ gap: 20 }}>
        {/* Memory Game Results (Alzheimer only) */}
        {!isElderly && results.length > 0 && (
          <View>
            <Text style={s.modalSectionTitle}>Memory Game Performance</Text>
            {results.slice(0, 3).map((r, i) => (
              <View key={i} style={s.resItem}>
                <View>
                  <Text style={s.resScore}>Score: {r.score} / {r.total}</Text>
                  <Text style={s.resDate}>{new Date(r.playedAt).toLocaleDateString()}</Text>
                </View>
                <View style={[s.pBadge, { backgroundColor: r.score/r.total > 0.7 ? COLORS.success : COLORS.warning }]}>
                    <Text style={s.pBadgeT}>{Math.round((r.score/r.total)*100)}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tasks / Routines */}
        <View>
          <Text style={s.modalSectionTitle}>Daily Routines & Tasks</Text>
          {tasks.length === 0 ? <Text style={s.emptyT}>No tasks assigned yet</Text> : 
            tasks.map(t => (
              <View key={t._id} style={s.healthItem}>
                <View style={[s.statusDot, { backgroundColor: t.status === 'done' ? COLORS.success : COLORS.muted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.healthText, t.status === 'done' && s.strike]}>{t.text}</Text>
                  <Text style={s.healthSub}>{t.status === 'done' ? 'Completed' : 'Pending'}</Text>
                </View>
              </View>
            ))
          }
        </View>

        {/* Care Notes */}
        <View>
          <Text style={s.modalSectionTitle}>{isElderly ? 'Notepad Entries' : 'Caregiver Instructions'}</Text>
          {notes.length === 0 ? <Text style={s.emptyT}>No instructions or notes recorded</Text> : 
            notes.map(n => (
              <View key={n._id} style={s.healthItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.healthText}>{isElderly ? n.title : n.text}</Text>
                  <Text style={s.healthSub}>
                    {isElderly ? n.content : `Status: ${n.status?.toUpperCase() || 'PENDING'}`}
                  </Text>
                  <Text style={s.dateT}>{new Date(n.createdAt).toLocaleString()}</Text>
                </View>
              </View>
            ))
          }
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.replace("/")} style={s.back}>
            <Text style={s.backT}>← Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fetchHealthData()} style={{ alignItems: 'center' }}>
            <Text style={s.hIcon}>👨‍👩‍👧</Text>
            <Text style={s.hTitle}>Guardian Dashboard</Text>
            <Text style={s.hSub}>
              {user?.linkedPatientName ? `Monitoring: ${user.linkedPatientName}` : `Welcome, ${user?.name || "Guardian"}`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.notice}>
          <Text style={s.noticeIcon}>👁️</Text>
          <Text style={s.noticeText}>Monitoring access — Read-only information for patient wellbeing</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Safety & Health Monitoring</Text>
          <View style={s.mainActions}>
            <TouchableOpacity 
              style={[s.mainCard, { backgroundColor: isElderly ? "#EA580C" : "#DC2626" }]} 
              activeOpacity={0.8} 
              onPress={() => {
                if (isElderly) {
                  Alert.alert(
                    "🚧 Coming Soon",
                    "Safety alerts for fall detection and abnormal movements in Elderly Care are currently being built. Check back soon!",
                    [{ text: "OK" }]
                  );
                } else {
                  router.push("/caregiver?tab=alerts");
                }
              }}
            >
              <Text style={s.mainIcon}>{isElderly ? "🚼" : "🚨"}</Text>
              <Text style={s.mainTitle}>{isElderly ? "FALL & MOVEMENT ALERTS" : "SAFETY ALERTS"}</Text>
              <Text style={s.mainSub}>{isElderly ? "Fall detection & abnormal movements" : "View real-time movement logs"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.mainCard, { backgroundColor: "#7C3AED" }]} 
              activeOpacity={0.8} 
              onPress={openHealthInfo}
            >
              <Text style={s.mainIcon}>❤️</Text>
              <Text style={s.mainTitle}>HEALTH INFO</Text>
              <Text style={s.mainSub}>Read-only patient summary</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>General Features</Text>
          {featureItems.map((f, i) => (
            <TouchableOpacity key={i} style={s.featureCard} onPress={() => router.push(f.route)} activeOpacity={0.7}>
              <View style={[s.fIcon, { backgroundColor: f.color }]}>
                <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fTitle}>{f.title}</Text>
                <Text style={s.fSub}>{f.sub}</Text>
              </View>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={showHealthModal} animationType="slide" transparent={true} onRequestClose={() => setShowHealthModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>Health Monitoring</Text>
                <Text style={s.modalSub}>Patient: {user?.linkedPatientName || 'None'}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHealthModal(false)} style={s.closeBtn}>
                <Text style={s.closeBtnT}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              {renderHealthContent()}
            </ScrollView>

            <View style={s.modalFooter}>
                <Text style={s.footerT}>This information is updated in real-time by the caregiver and patient.</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 55, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: "center" },
  back: { position: "absolute", top: 55, left: 20 },
  backT: { color: "#C7D2FE", fontSize: 15, fontWeight: "600" },
  hIcon: { fontSize: 36, marginBottom: 8 },
  hTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  hSub: { color: "#C7D2FE", fontSize: 14, marginTop: 4 },
  notice: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245,158,11,0.12)", marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)", gap: 10 },
  noticeIcon: { fontSize: 20 },
  noticeText: { color: "#FCD34D", fontSize: 13, flex: 1 },
  mainActions: { flexDirection: 'row', gap: 12, marginTop: 5 },
  mainCard: { flex: 1, borderRadius: 20, padding: 20, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  mainIcon: { fontSize: 32, marginBottom: 8 },
  mainTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  mainSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 4, textAlign: 'center' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, width: "31%", marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  cIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  cTitle: { fontSize: 12, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  cSub: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: "center" },
  featureCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  fIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 14 },
  fTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  fSub: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  arrow: { color: COLORS.border, fontSize: 24 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.bg, height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  modalSub: { color: COLORS.accent, fontSize: 13, fontWeight: '600', marginTop: 2 },
  modalSectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  closeBtn: { backgroundColor: COLORS.card, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  closeBtnT: { color: COLORS.text, fontSize: 14 },
  
  healthItem: { backgroundColor: COLORS.card, padding: 15, borderRadius: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  healthSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  strike: { textDecorationLine: 'line-through', opacity: 0.6 },
  dateT: { color: COLORS.muted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },
  emptyT: { color: COLORS.muted, textAlign: 'center', fontStyle: 'italic', marginVertical: 20 },
  modalFooter: { padding: 20, backgroundColor: COLORS.card, alignItems: 'center' },
  footerT: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  
  resItem: { backgroundColor: COLORS.card, padding: 15, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resScore: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  resDate: { color: COLORS.muted, fontSize: 12 },
  pBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pBadgeT: { color: '#fff', fontSize: 12, fontWeight: '900' }
});
