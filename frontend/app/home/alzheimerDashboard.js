import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AlzheimerDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alzheimer Dashboard</Text>
      <Text style={styles.text}>Welcome! Your data is saved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});