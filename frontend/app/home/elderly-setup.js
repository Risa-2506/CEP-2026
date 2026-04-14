import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ElderlySetup() {
  const { user, isLoggedIn, token, refreshUser, elderlySignup } = useAuth();
  
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState(""); // For Guest Signup
  const [password, setPassword] = useState(""); // For Guest Signup
  
  // Auto-fill logged-in user data
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log("Auto-filling Elderly setup for:", user.email);
      setPatientName(prev => prev || user.name || "");
      setEmail(prev => prev || user.email || "");
    }
  }, [isLoggedIn, user]);

  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [caregiverEmail, setCaregiverEmail] = useState("");
  const [guardians, setGuardians] = useState([{ name: "", phone: "", email: "" }]);
  const [emergencyContacts, setEmergencyContacts] = useState([{ name: "", phone: "", relationship: "" }]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const addGuardian = () => {
    setGuardians([...guardians, { name: "", phone: "", email: "" }]);
  };

  const removeGuardian = (index) => {
    if (guardians.length === 1) return;
    setGuardians(guardians.filter((_, i) => i !== index));
  };

  const updateGuardian = (index, field, value) => {
    const updated = [...guardians];
    updated[index][field] = value;
    setGuardians(updated);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", phone: "", relationship: "" }]);
  };

  const removeEmergencyContact = (index) => {
    if (emergencyContacts.length === 1) return;
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      Alert.alert("Error", "Patient name is required");
      return;
    }

    const validatePhone = (num) => num.replace(/[^0-9]/g, '').length === 10;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLoggedIn) {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Email and Password are required for account creation");
            return;
        }
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Error", "Please enter a valid patient email address");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }
    }

    if (caregiverPhone && !validatePhone(caregiverPhone)) {
        Alert.alert("Error", "Caregiver phone must be a valid 10-digit number");
        return;
    }

    if (caregiverEmail && !emailRegex.test(caregiverEmail.trim())) {
        Alert.alert("Error", "Please enter a valid caregiver email address");
        return;
    }

    // Validate Guardians
    for (const g of guardians) {
        if (g.phone && !validatePhone(g.phone)) {
            Alert.alert("Error", `Guardian ${g.name || ''} has an invalid phone number. Must be 10 digits.`);
            return;
        }
    }

    setSaving(true);
    try {
      const details = {
        patientName: patientName.trim(),
        age: age ? parseInt(age) : null,
        caregiver: {
          name: caregiverName.trim(),
          phone: caregiverPhone.replace(/[^0-9]/g, ''),
          email: caregiverEmail.trim().toLowerCase(),
        },
        guardians: guardians.filter((g) => g.name.trim() || g.phone.trim()).map((g) => ({
          name: g.name.trim(),
          phone: g.phone.replace(/[^0-9]/g, ''),
          email: g.email.trim().toLowerCase(),
        })),
        emergencyContacts: emergencyContacts.filter((e) => e.name.trim() || e.phone.trim()).map((e) => ({
          name: e.name.trim(),
          phone: e.phone.replace(/[^0-9]/g, ''),
          relationship: e.relationship.trim(),
        })),
      };

      if (!isLoggedIn) {
          // CASE A: Guest Signup
          const result = await elderlySignup({
              ...details,
              email: email.trim().toLowerCase(),
              password: password,
              name: patientName.trim(),
          });
          if (result.success) {
              router.replace("/home/elderlyDashboard");
          } else {
              Alert.alert("Signup Failed", result.message);
          }
      } else {
          // CASE B: Logged-in setup
          const res = await fetch(`${BASE_URL}/elderly`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(details),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Failed to save profile");
          }

          await refreshUser();
          router.replace("/home/elderlyDashboard");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/")} style={styles.backBtn}>
            <Text style={styles.backText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerIcon}>👴</Text>
          <Text style={styles.headerTitle}>Elderly Care Setup</Text>
          <Text style={styles.headerSub}>Set up your care profile</Text>
        </View>

        {/* Guest Account Section */}
        {!isLoggedIn && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>🔐 Global Account Details</Text>
            <Text style={styles.sectionHint}>Create an account to manage your profile</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Email Address *"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Password (min 6 chars) *"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={{ color: "#FCD34D", fontSize: 13, textAlign: "center", marginTop: 8 }}>
                Already have an account? <Text style={{ fontWeight: "700" }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Patient Info Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>👤 Patient Information</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Full Name *"
              placeholderTextColor="#94A3B8"
              value={patientName}
              onChangeText={setPatientName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Age"
              placeholderTextColor="#94A3B8"
              value={age}
              onChangeText={setAge}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Caregiver Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>👩‍⚕️ Caregiver Details</Text>
          <Text style={styles.sectionHint}>The primary person responsible for care</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Caregiver Name"
              placeholderTextColor="#94A3B8"
              value={caregiverName}
              onChangeText={setCaregiverName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Caregiver Phone"
              placeholderTextColor="#94A3B8"
              value={caregiverPhone}
              onChangeText={setCaregiverPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Caregiver Email"
              placeholderTextColor="#94A3B8"
              value={caregiverEmail}
              onChangeText={setCaregiverEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Guardians Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>👨‍👩‍👧 Guardians</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addGuardian}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionHint}>People who can view your data</Text>

          {guardians.map((guardian, index) => (
            <View key={index} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>Guardian {index + 1}</Text>
                {guardians.length > 1 && (
                  <TouchableOpacity onPress={() => removeGuardian(index)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <TextInput placeholder="Name" placeholderTextColor="#94A3B8" value={guardian.name} onChangeText={(v) => updateGuardian(index, "name", v)} style={styles.input} />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput placeholder="Phone" placeholderTextColor="#94A3B8" value={guardian.phone} onChangeText={(v) => updateGuardian(index, "phone", v)} style={styles.input} keyboardType="phone-pad" />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput placeholder="Email" placeholderTextColor="#94A3B8" value={guardian.email} onChangeText={(v) => updateGuardian(index, "email", v)} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Finalize Setup</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  scrollContent: { flexGrow: 1 },
  header: {
    backgroundColor: "#B45309",
    paddingTop: 55, paddingBottom: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: "center",
  },
  backBtn: { position: "absolute", top: 55, left: 20 },
  backText: { color: "#FDE68A", fontSize: 15, fontWeight: "600" },
  headerIcon: { fontSize: 36, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headerSub: { color: "#FDE68A", fontSize: 13, marginTop: 4 },
  sectionCard: {
    backgroundColor: "#1E293B", marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#334155",
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { fontSize: 16, fontWeight: "700", color: "#F1F5F9", marginBottom: 4 },
  sectionHint: { fontSize: 12, color: "#64748B", marginBottom: 14 },
  addBtn: { backgroundColor: "#B45309", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  subCard: {
    backgroundColor: "#0F172A", borderRadius: 12, padding: 14, marginTop: 10,
    borderWidth: 1, borderColor: "#1E293B",
  },
  subCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  subCardTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  removeText: { color: "#EF4444", fontSize: 16, fontWeight: "700" },
  inputWrapper: { backgroundColor: "#0F172A", borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#334155" },
  input: { paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#E2E8F0" },
  submitBtn: {
    backgroundColor: "#B45309", marginHorizontal: 16, marginTop: 20, paddingVertical: 16,
    borderRadius: 14, alignItems: "center",
    shadowColor: "#B45309", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
