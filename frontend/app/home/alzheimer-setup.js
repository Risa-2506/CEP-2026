import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function AlzheimerSetup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [caregiver, setCaregiver] = useState("");
  const [guardian, setGuardian] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alzheimer Setup</Text>

      <TextInput
        placeholder="Patient Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        style={styles.input}
      />

      <TextInput
        placeholder="Caregiver (optional)"
        value={caregiver}
        onChangeText={setCaregiver}
        style={styles.input}
      />

      <TextInput
        placeholder="Guardian (optional)"
        value={guardian}
        onChangeText={setGuardian}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          try {
            const res = await fetch(`${BASE_URL}/alzheimer`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name,
                age,
                caregiver,
                guardian,
              }),
            });

            const data = await res.json();

            console.log("Saved:", data);
            //router.push("alzheimerDashboard");
            router.push({
                pathname: "/home/alzheimerDashboard"
              });

          } catch (error) {
            console.log("Error:", error);
          }
        }}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
});