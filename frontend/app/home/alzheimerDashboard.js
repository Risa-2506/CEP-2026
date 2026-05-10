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
    { id: "notes", icon: "📋", title: "Care Notes", sub: "Instructions & notes", color: "#D97706" },
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
    backgroundColor: "#F0F6FF",
  },
  header: {
    backgroundColor: "#7C3AED",
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
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
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    gap: 14,
  },
  emergencyIcon: {
    fontSize: 32,
  },
  emergencyTitle: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "800",
  },
  emergencySub: {
    color: "#EF4444",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    shadowColor: "#0E7490",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  cardSub: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});