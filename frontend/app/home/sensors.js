import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, SafeAreaView, Platform, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { alzheimerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useSensors } from "../../context/SensorContext";

const COLORS = {
  bg: "#F0F6FF",
  card: "#FFFFFF",
  primary: "#0E7490",
  danger: "#EF4444",
  success: "#10B981",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0"
};

export default function Sensors() {
  const router = useRouter();
  const { autoConfirm } = useLocalSearchParams();
  const { user } = useAuth();
  const { isMonitoring } = useSensors();

  const [detectorState, setDetectorState] = useState("idle"); // idle, confirming
  const [countdown, setCountdown] = useState(10);
  const [cooldown, setCooldown] = useState(0);

  const countdownTimer = useRef(null);
  const cooldownTimer = useRef(null);

  // Auto-trigger if navigated here via fall detection
  useEffect(() => {
    if (autoConfirm === "true" && detectorState === "idle" && cooldown === 0) {
      setDetectorState("confirming");
      startConfirmation();
    }
  }, [autoConfirm]);

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

  const handleManualCall = () => {
    Alert.alert(
      "Emergency Call",
      "Are you sure you want to call emergency services?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call 112", onPress: () => Linking.openURL("tel:112"), style: "destructive" }
      ]
    );
  };

  const overrideAlert = () => {
      clearInterval(countdownTimer.current);
      triggerCooldown();
  };

  const triggerCooldown = () => {
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

  useEffect(() => {
      return () => {
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>🩺</Text>
          <Text style={styles.title}>Fall Detection</Text>
          <Text style={styles.sub}>
            Your device is currently monitoring for sudden impacts and falls in the background.
          </Text>
          
          <View style={styles.statusBox}>
            <View style={[styles.statusDot, { backgroundColor: cooldown > 0 ? COLORS.muted : COLORS.success }]} />
            <Text style={styles.statusText}>
              {cooldown > 0 ? `Cooldown (${cooldown}s)` : isMonitoring ? "Monitoring Active" : "Initializing..."}
            </Text>
          </View>

          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.emergencyBtn} 
            onPress={handleManualCall}
          >
            <Text style={styles.emergencyBtnText}>CALL EMERGENCY SERVICES</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Detection starts automatically when you log in.
          </Text>
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
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  card: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 30, alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: "#0E7490", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  icon: { fontSize: 50, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  sub: { color: COLORS.muted, fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, width: "100%", marginVertical: 24 },
  
  statusBox: { flexDirection: "row", alignItems: "center", marginTop: 20, backgroundColor: "#F0FDF4", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: "#BBF7D0" },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusText: { color: "#064E3B", fontWeight: "600", fontSize: 14 },
  
  emergencyBtn: { backgroundColor: COLORS.danger, width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  emergencyBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.5 },
  
  note: { color: COLORS.muted, fontSize: 12, marginTop: 20, fontStyle: "italic" },

  modalBg: { flex: 1, backgroundColor: "rgba(15,23,42,0.75)", justifyContent: "flex-end", padding: 20 },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 30, alignItems: "center", borderWidth: 2, borderColor: COLORS.danger },
  modalIcon: { fontSize: 60, marginBottom: 10 },
  modalTitle: { fontSize: 28, fontWeight: "900", color: COLORS.danger, marginBottom: 10 },
  modalSub: { color: "#1E293B", fontSize: 16, textAlign: "center", marginBottom: 20, lineHeight: 24 },
  countdownText: { fontSize: 70, fontWeight: "900", color: COLORS.danger, marginBottom: 30 },
  cancelBtn: { backgroundColor: COLORS.success, width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", marginBottom: 12 },
  cancelBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  sosBtn: { backgroundColor: "transparent", width: "100%", paddingVertical: 18, borderRadius: 16, alignItems: "center", borderWidth: 2, borderColor: COLORS.danger },
  sosBtnText: { color: COLORS.danger, fontWeight: "800", fontSize: 16 }
});
