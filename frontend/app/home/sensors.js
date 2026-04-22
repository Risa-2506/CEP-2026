import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, SafeAreaView, Platform, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { alzheimerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  bg: "#0F172A",
  card: "#1E293B",
  primary: "#3B82F6",
  danger: "#EF4444",
  success: "#10B981",
  text: "#F8FAFC",
  muted: "#94A3B8",
  border: "#334155"
};

export default function Sensors() {
  const router = useRouter();
  const { user } = useAuth();

  const [isActive, setIsActive] = useState(false);
  const [detectorState, setDetectorState] = useState("idle"); // idle, confirming
  const [countdown, setCountdown] = useState(10);
  const [cooldown, setCooldown] = useState(0);

  const subscription = useRef(null);
  const stateRef = useRef("idle");
  const lastFreefallTime = useRef(0);
  
  const countdownTimer = useRef(null);
  const cooldownTimer = useRef(null);

  const toggleSensors = async () => {
    if (isActive) {
      if (subscription.current) {
        subscription.current.remove();
        subscription.current = null;
      }
      setIsActive(false);
      resetState();
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Error", "Location permission is required for emergency alerts.");
        return;
      }
      
      setIsActive(true);
      Accelerometer.setUpdateInterval(100);
      subscription.current = Accelerometer.addListener(data => {
        if (cooldown > 0) return; // Prevent parsing if cooling down
        const magnitude = Math.sqrt(data.x*data.x + data.y*data.y + data.z*data.z);
        handleSensorData(magnitude);
      });
    }
  };

  const handleSensorData = (mag) => {
    if (stateRef.current === "confirming") return;

    // Pattern: Freefall (< 0.5g) -> Impact (> 2.5g)
    if (stateRef.current === "idle" && mag < 0.5) {
      stateRef.current = "freefall";
      lastFreefallTime.current = Date.now();
    } 
    else if (stateRef.current === "freefall") {
       const timeSinceFall = Date.now() - lastFreefallTime.current;
       if (timeSinceFall > 2500) {
           // Timeout trying to find impact
           stateRef.current = "idle";
       } else if (mag > 2.5) {
           // IMPACT DETECTED
           stateRef.current = "confirming";
           setDetectorState("confirming");
           startConfirmation();
       }
    }
  };

  const startConfirmation = () => {
     setCountdown(10);
     if (countdownTimer.current) clearInterval(countdownTimer.current);
     
     countdownTimer.current = setInterval(() => {
        setCountdown(prev => {
           if (prev <= 1) {
              clearInterval(countdownTimer.current);
              triggerEmergency();
              return 0;
           }
           return prev - 1;
        });
     }, 1000);
  };

  const triggerEmergency = async () => {
      setDetectorState("idle");
      triggerCooldown();
      
      const isIndependentPatient = !user?.linkedPatientType && user?.role === 'patient';

      // 1. ALWAYS dial hospital logic immediately
      Linking.openURL("tel:112").catch(() => console.log("Failed to open dialer."));

      // If they have no caregivers/linked profiles, they don't have a linked backend profile to receive alerts anyway
      if (isIndependentPatient) {
          return; 
      }

      // 2. Get Location & Dispatch API for linked patients
      try {
          let coords = { latitude: 0, longitude: 0 };
          let addressString = "Unknown Location";
          
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = loc.coords;
          
          try {
            const response = await fetch(
               `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
               { headers: { 'User-Agent': 'HealthVerse-Patient-App' } }
            );
            const data = await response.json();
            if (data && data.display_name) addressString = data.display_name;
          } catch(err) {
             console.log("Geocoding failed for fall tracking", err);
          }
          
          await alzheimerAPI.geofence.triggerAlert({
              lat: coords.latitude,
              lng: coords.longitude,
              address: addressString,
              type: "fall"
          });
      } catch (e) {
          console.log("Failed to send fall alert", e);
      }
  };

  const overrideAlert = () => {
      clearInterval(countdownTimer.current);
      triggerCooldown();
  };

  const triggerCooldown = () => {
      stateRef.current = "idle";
      setDetectorState("idle");
      setCooldown(30);
      
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      cooldownTimer.current = setInterval(() => {
          setCooldown(prev => {
              if (prev <= 1) {
                  clearInterval(cooldownTimer.current);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  };

  const resetState = () => {
    stateRef.current = "idle";
    setDetectorState("idle");
    setCooldown(0);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
  };

  useEffect(() => {
      return () => {
          if (subscription.current) subscription.current.remove();
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.backButton}>
          <Text style={styles.backButtonIcon}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Sensors</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>🩺</Text>
          <Text style={styles.title}>Fall Detection</Text>
          <Text style={styles.sub}>Continuously monitors device movement for sudden impacts.</Text>
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={[styles.toggleBtn, isActive ? styles.toggleActive : styles.toggleInactive ]} 
            onPress={toggleSensors}
          >
            <Text style={styles.toggleBtnText}>{isActive ? "STOP DETECTION" : "START DETECTION"}</Text>
          </TouchableOpacity>

          {isActive && (
            <View style={styles.statusBox}>
              <View style={[styles.statusDot, { backgroundColor: cooldown > 0 ? COLORS.muted : COLORS.success }]} />
              <Text style={styles.statusText}>
                {cooldown > 0 ? `Cooldown (${cooldown}s)` : "Monitoring Active..."}
              </Text>
            </View>
          )}
        </View>

        {/* CONFIRMATION MODAL */}
        <Modal visible={detectorState === "confirming"} transparent animationType="slide">
           <View style={styles.modalBg}>
              <View style={styles.modalCard}>
                 <Text style={styles.modalIcon}>⚠️</Text>
                 <Text style={styles.modalTitle}>Fall Detected!</Text>
                 <Text style={styles.modalSub}>Are you ok? We will alert emergency contacts and hospitals in...</Text>
                 <Text style={styles.countdownText}>{countdown}s</Text>
                 
                 <TouchableOpacity style={styles.cancelBtn} onPress={overrideAlert}>
                    <Text style={styles.cancelBtnText}>I'M OKAY (CANCEL)</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={styles.sosBtn} onPress={() => {
                     clearInterval(countdownTimer.current);
                     triggerEmergency();
                 }}>
                    <Text style={styles.sosBtnText}>HELP ME NOW</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { backgroundColor: COLORS.card, paddingVertical: 15, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },
  backButtonIcon: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center" },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 30, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  icon: { fontSize: 50, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  sub: { color: COLORS.muted, fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, width: "100%", marginVertical: 24 },
  toggleBtn: { width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  toggleInactive: { backgroundColor: COLORS.primary },
  toggleActive: { backgroundColor: COLORS.danger },
  toggleBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 1 },
  statusBox: { flexDirection: "row", alignItems: "center", marginTop: 20, backgroundColor: "#0F172A", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusText: { color: COLORS.text, fontWeight: "600", fontSize: 14 },
  
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end", padding: 20 },
  modalCard: { backgroundColor: COLORS.card, borderRadius: 24, padding: 30, alignItems: "center", borderWidth: 1, borderColor: COLORS.danger },
  modalIcon: { fontSize: 60, marginBottom: 10 },
  modalTitle: { fontSize: 28, fontWeight: "900", color: COLORS.danger, marginBottom: 10 },
  modalSub: { color: COLORS.text, fontSize: 16, textAlign: "center", marginBottom: 20, lineHeight: 24 },
  countdownText: { fontSize: 70, fontWeight: "900", color: "#fff", marginBottom: 30 },
  cancelBtn: { backgroundColor: COLORS.success, width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", marginBottom: 12 },
  cancelBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  sosBtn: { backgroundColor: "transparent", width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", borderWidth: 2, borderColor: COLORS.danger },
  sosBtnText: { color: COLORS.danger, fontWeight: "800", fontSize: 16 }
});
