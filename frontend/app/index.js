import React from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.title}>HealthVerse</Text>

        <TextInput
          placeholder="Search healthcare features..."
          style={styles.search}
        />
      </View>

      {/* Feature Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Healthcare Features</Text>

        <TouchableOpacity style={styles.card} onPress={() => router.push("home/doctors")}>
          <Text style={styles.cardTitle}>🩺 Find Doctors</Text>
          <Text style={styles.cardSub}>Search by specialization</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("home/remedies")}>
          <Text style={styles.cardTitle}>🌿 Home Remedies</Text>
          <Text style={styles.cardSub}>Natural illness solutions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("home/alzheimer-setup")}>
          <Text style={styles.cardTitle}>🧠 Alzheimer Care</Text>
          <Text style={styles.cardSub}>Patient & caregiver support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>❤️ Elderly Care</Text>
          <Text style={styles.cardSub}>Health & memory tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>🚨 Smart Sensors</Text>
          <Text style={styles.cardSub}>Fall detection & alerts</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  header: {
    backgroundColor: "#2563EB",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  welcome: {
    color: "#c7d2fe",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 25,
  },

  section: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  cardSub: {
    color: "#666",
    marginTop: 5,
  },
});