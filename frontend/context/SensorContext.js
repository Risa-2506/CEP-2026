import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";

const SensorContext = createContext();

export function SensorProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const subscription = useRef(null);
  const stateRef = useRef("idle");
  const lastFreefallTime = useRef(0);

  const startMonitoring = () => {
    if (subscription.current) return;

    Accelerometer.setUpdateInterval(100);
    subscription.current = Accelerometer.addListener(data => {
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      handleSensorData(magnitude);
    });
    setIsMonitoring(true);
    console.log("🟢 Fall Detection Monitoring Started");
  };

  const stopMonitoring = () => {
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }
    setIsMonitoring(false);
    stateRef.current = "idle";
    console.log("🔴 Fall Detection Monitoring Stopped");
  };

  const handleSensorData = (mag) => {
    // Basic Fall Detection Logic (Freefall -> Impact)
    if (stateRef.current === "idle" && mag < 0.5) {
      stateRef.current = "freefall";
      lastFreefallTime.current = Date.now();
    } 
    else if (stateRef.current === "freefall") {
      const timeSinceFall = Date.now() - lastFreefallTime.current;
      if (timeSinceFall > 2500) {
        stateRef.current = "idle";
      } else if (mag > 2.5) {
        // IMPACT DETECTED
        stateRef.current = "idle"; // Reset for next detection
        console.log("⚠️ Fall Detected! Navigating to Sensors screen...");
        router.push("/home/sensors?autoConfirm=true");
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    return () => stopMonitoring();
  }, [isLoggedIn]);

  return (
    <SensorContext.Provider value={{ isMonitoring, startMonitoring, stopMonitoring }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensors() {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error("useSensors must be used within a SensorProvider");
  }
  return context;
}
