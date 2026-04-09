import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function GuardianDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const features = [
    { icon: "🩺", title: "Find Doctors", sub: "Search by specialization", color: "#1E40AF", route: "home/doctors" },
    { icon: "🌿", title: "Home Remedies", sub: "Natural solutions", color: "#166534", route: "home/remedies" },
    { icon: "🚨", title: "Smart Sensors", sub: "Fall detection & alerts", color: "#DC2626", route: "home/sensors" },
  ];

  const guardianItems = [
    { icon: "📍", title: "Patient Location", sub: "View live location", color: "#2563EB" },
    { icon: "🚨", title: "Alerts", sub: "Notifications & warnings", color: "#DC2626" },
    { icon: "❤️", title: "Health Info", sub: "Basic health data", color: "#7C3AED" },
  ];

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.replace("/")} style={s.back}>
            <Text style={s.backT}>← Home</Text>
          </TouchableOpacity>
          <Text style={s.hIcon}>👨‍👩‍👧</Text>
          <Text style={s.hTitle}>Guardian Dashboard</Text>
          <Text style={s.hSub}>
            {user?.linkedPatientName ? `Monitoring: ${user.linkedPatientName}` : `Welcome, ${user?.name || "Guardian"}`}
          </Text>
        </View>

        {/* View-only notice */}
        <View style={s.notice}>
          <Text style={s.noticeIcon}>👁️</Text>
          <Text style={s.noticeText}>View-only access — You can monitor but cannot modify settings</Text>
        </View>

        {/* Guardian monitoring section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Patient Monitoring</Text>
          <View style={s.grid}>
            {guardianItems.map((it, i) => (
              <TouchableOpacity key={i} style={s.card} activeOpacity={0.8}>
                <View style={[s.cIcon, { backgroundColor: it.color }]}>
                  <Text style={{ fontSize: 24 }}>{it.icon}</Text>
                </View>
                <Text style={s.cTitle}>{it.title}</Text>
                <Text style={s.cSub}>{it.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Regular features */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Healthcare Features</Text>
          {features.map((f, i) => (
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
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { backgroundColor: "#4338CA", paddingTop: 55, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: "center" },
  back: { position: "absolute", top: 55, left: 20 },
  backT: { color: "#C7D2FE", fontSize: 15, fontWeight: "600" },
  hIcon: { fontSize: 36, marginBottom: 8 },
  hTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  hSub: { color: "#C7D2FE", fontSize: 14, marginTop: 4 },
  notice: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245,158,11,0.12)", marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)", gap: 10 },
  noticeIcon: { fontSize: 20 },
  noticeText: { color: "#FCD34D", fontSize: 13, flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#F1F5F9", marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { backgroundColor: "#1E293B", borderRadius: 16, padding: 18, width: "48%", marginBottom: 12, borderWidth: 1, borderColor: "#334155", alignItems: "center" },
  cIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  cTitle: { fontSize: 15, fontWeight: "700", color: "#F1F5F9", textAlign: "center" },
  cSub: { color: "#64748B", fontSize: 12, marginTop: 4, textAlign: "center" },
  featureCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1E293B", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  fIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 14 },
  fTitle: { fontSize: 16, fontWeight: "700", color: "#F1F5F9" },
  fSub: { color: "#64748B", fontSize: 13, marginTop: 3 },
  arrow: { color: "#475569", fontSize: 24 },
});
