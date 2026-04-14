import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function CaregiverDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const isElderly = user?.linkedPatientType === "elderly";

  const items = [
    { 
      id: "notes", 
      icon: "📋", 
      title: "Care Notes", 
      sub: "Instructions & Daily records", 
      color: "#16A34A" 
    },
    { 
      id: "tasks", 
      icon: "✅", 
      title: isElderly ? "Routines" : "Shared Routine", 
      sub: "Daily care tasks", 
      color: "#F59E0B" 
    },
    ...(isElderly ? [] : [
      { 
        id: "private", 
        icon: "🔒", 
        title: "Private Planning", 
        sub: "Personal caregiver notes", 
        color: "#BE185D" 
      }
    ]),
    { 
      id: isElderly ? "memories" : "game", 
      icon: isElderly ? "📸" : "🧠", 
      title: isElderly ? "Memories" : "Memory Manager", 
      sub: isElderly ? "Patient memories" : "Game results", 
      color: "#7C3AED" 
    },
    { 
      id: "contacts", 
      icon: "📞", 
      title: "Emergency Contacts", 
      sub: "Authorized support", 
      color: "#2563EB" 
    },
    { 
      id: "location", 
      icon: "📍", 
      title: "Patient Location", 
      sub: "Live tracking", 
      color: "#3B82F6", 
      locked: isElderly 
    },
    { 
      id: "alerts", 
      icon: "🚨", 
      title: "Alerts", 
      sub: "Fall & Safety logs", 
      color: "#DC2626", 
      locked: isElderly 
    },
  ];

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.replace("/")} style={s.back}>
            <Text style={s.backT}>← Home</Text>
          </TouchableOpacity>
          <Text style={s.hIcon}>👩‍⚕️</Text>
          <Text style={s.hTitle}>Caregiver Dashboard</Text>
          <Text style={s.hSub}>
            {user?.linkedPatientName ? `Monitoring: ${user.linkedPatientName}` : `Welcome, ${user?.name || "Caregiver"}`}
          </Text>
        </View>

        {/* Coming Soon Section */}
        <View style={s.soonCard}>
          <Text style={s.soonIcon}>🚧</Text>
          <Text style={s.soonTitle}>Caregiver Features Coming Soon</Text>
          <Text style={s.soonText}>
            We are building tools for you to track {user?.linkedPatientName || "your patient"}s health, location, and daily activities in real-time.
          </Text>
        </View>

        <View style={s.grid}>
          {items.map((it, i) => (
            <TouchableOpacity 
              key={i} 
              style={[s.card, it.locked && { opacity: 0.5 }]} 
              activeOpacity={it.locked ? 1 : 0.8}
              onPress={() => {
                if (!it.locked) {
                  router.push(`/caregiver?tab=${it.id}`);
                }
              }}
            >
              <View style={[s.cIcon, { backgroundColor: it.color }]}>
                <Text style={{ fontSize: 24 }}>{it.icon}</Text>
              </View>
              <Text style={s.cTitle}>{it.title}</Text>
              <Text style={s.cSub}>{it.locked ? "Locked" : it.sub}</Text>
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
  header: { backgroundColor: "#0E7490", paddingTop: 55, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: "center" },
  back: { position: "absolute", top: 55, left: 20 },
  backT: { color: "#A5F3FC", fontSize: 15, fontWeight: "600" },
  hIcon: { fontSize: 36, marginBottom: 8 },
  hTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  hSub: { color: "#A5F3FC", fontSize: 14, marginTop: 4 },
  banner: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16,185,129,0.15)", marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981", marginRight: 10 },
  bannerT: { color: "#6EE7B7", fontSize: 14, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 16 },
  card: { backgroundColor: "#1E293B", borderRadius: 16, padding: 18, width: "48%", marginBottom: 12, borderWidth: 1, borderColor: "#334155", alignItems: "center" },
  cIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  cTitle: { fontSize: 15, fontWeight: "700", color: "#F1F5F9", textAlign: "center" },
  cSub: { color: "#64748B", fontSize: 12, marginTop: 4, textAlign: "center" },
  soonCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  soonIcon: { fontSize: 32, marginBottom: 8 },
  soonTitle: { fontSize: 16, fontWeight: "700", color: "#F1F5F9", marginBottom: 6 },
  soonText: { fontSize: 13, color: "#94A3B8", textAlign: "center", lineHeight: 20 },
});
