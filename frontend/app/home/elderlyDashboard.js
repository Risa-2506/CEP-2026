import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function ElderlyDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/")} style={styles.backBtn}>
            <Text style={styles.backText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerIcon}>👴</Text>
          <Text style={styles.headerTitle}>Elderly Care Dashboard</Text>
          <Text style={styles.headerSub}>Welcome, {user?.name || "Patient"}</Text>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.soonCard}>
          <Text style={styles.soonIcon}>🚀</Text>
          <Text style={styles.soonTitle}>Features Coming Soon</Text>
          <Text style={styles.soonText}>
            We are working on bringing specialized features for elderly care, including medicine tracking, fall detection, and daily routine management.
          </Text>
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
    backgroundColor: "#B45309",
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
    color: "#FDE68A",
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
    color: "#FDE68A",
    fontSize: 14,
    marginTop: 4,
  },
  soonCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 16,
    marginTop: 40,
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    borderStyle: "dashed",
  },
  soonIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  soonTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 10,
  },
  soonText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },
});
