import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AlzheimerDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const dashboardItems = [
    { id: "game", icon: "🧠", title: "Memory Game", sub: "Play to train memory", color: "#7C3AED" },
    { id: "tasks", icon: "✅", title: "Tasks / Routine", sub: "Daily activities", color: "#16A34A" },
    { id: "contacts", icon: "📞", title: "Contacts", sub: "Important contacts", color: "#2563EB" },
    { id: "notes", icon: "📋", title: "Care Notes", sub: "Instructions & notes", color: "#B45309" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/")} style={styles.backBtn}>
            <Text style={styles.backText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerIcon}>🧠</Text>
          <Text style={styles.headerTitle}>Patient Dashboard</Text>
          <Text style={styles.headerSub}>Welcome, {user?.name || "Patient"}</Text>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyBtn} activeOpacity={0.7}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <View>
            <Text style={styles.emergencyTitle}>Emergency</Text>
            <Text style={styles.emergencySub}>Tap to alert caregiver & guardians</Text>
          </View>
        </TouchableOpacity>

        {/* Dashboard Cards */}
        <View style={styles.grid}>
          {dashboardItems.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => router.push(`/alzheimer?tab=${item.id}`)}
            >
              <View style={[styles.cardIconBox, { backgroundColor: item.color }]}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    backgroundColor: "#7C3AED",
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 55,
    left: 20,
  },
  backText: {
    color: "#DDD6FE",
    fontSize: 15,
    fontWeight: "600",
  },
  headerIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  headerSub: {
    color: "#DDD6FE",
    fontSize: 14,
    marginTop: 4,
  },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#991B1B",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
    gap: 14,
  },
  emergencyIcon: {
    fontSize: 32,
  },
  emergencyTitle: {
    color: "#FCA5A5",
    fontSize: 18,
    fontWeight: "800",
  },
  emergencySub: {
    color: "#FECACA",
    fontSize: 12,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  cardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F1F5F9",
    textAlign: "center",
  },
  cardSub: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});