import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Sensors() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🚨</Text>
        <Text style={styles.title}>Smart Sensors</Text>
        <Text style={styles.sub}>Fall detection & health alerts</Text>
        <View style={styles.divider} />
        <Text style={styles.comingSoon}>🔧 Coming Soon</Text>
        <Text style={styles.desc}>
          This feature is under development. It will include fall detection,
          unsafe zone alerts, and real-time health monitoring.
        </Text>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/")}>
        <Text style={styles.backText}>← Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    width: "100%",
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F1F5F9",
  },
  sub: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    width: "100%",
    marginVertical: 20,
  },
  comingSoon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 8,
  },
  desc: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
  },
  backBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#334155",
    borderRadius: 12,
  },
  backText: {
    color: "#E2E8F0",
    fontWeight: "600",
    fontSize: 14,
  },
});
