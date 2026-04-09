import React, { useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn, logout, token } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const cardAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Stagger card animations
    const animations = cardAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 100 + i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, animations).start();
  }, []);

  // Auth-aware navigation
  const handleFeaturePress = async (feature) => {
    switch (feature) {
      case "remedies":
        // No login required
        router.push("home/remedies");
        break;
      
      case "doctors":
      case "sensors":
        if (!isLoggedIn) {
          router.push({ pathname: "/auth/login", params: { redirectTo: `home/${feature}` } });
        } else {
          router.push(`home/${feature}`);
        }
        break;

      case "alzheimer":
      case "elderly":
        if (!isLoggedIn) {
          // GUEST FLOW: Go straight to setup
          router.push(feature === "elderly" ? "home/elderly-setup" : "home/alzheimer-setup");
        } else {
          // LOGGED IN FLOW:
          // 1. Check for specific module profile
          try {
            const endpoint = feature === "elderly" ? "/elderly/check" : "/alzheimer/check";
            const res = await fetch(`${BASE_URL}${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.hasProfile) {
              // User is a patient for this module
              router.push(feature === "elderly" ? "home/elderlyDashboard" : "home/alzheimerDashboard");
            } else {
              // Check if they are a caregiver or guardian for this module
              // If they are a generic caregiver/guardian, we still want to let them see their own patient setup if they want
              // OR check if they have a relationship in this specific module.
              
              const userEmail = user.email.toLowerCase().trim();
              const profile = data.profile; // This might be null if hasProfile is false but they could still be caregiver
              
              // We need to re-check if they are a caregiver/guardian for this specific module
              // The backend '/check' endpoint only returns if they are the PATIENT (userId match)
              
              // For now, let's just go to setup if not a patient, 
              // but we should probably check caregiver/guardian status too.
              // However, the user said: "If no → show setup form"
              router.push(feature === "elderly" ? "home/elderly-setup" : "home/alzheimer-setup");
            }
          } catch (error) {
            console.error("Check error:", error);
            router.push(feature === "elderly" ? "home/elderly-setup" : "home/alzheimer-setup");
          }
        }
        break;
    }
  };

  const features = [
    {
      key: "doctors",
      icon: "🩺",
      title: "Find Doctors",
      sub: "Search by specialization",
      colors: ["#1E40AF", "#3B82F6"],
      requiresLogin: true,
    },
    {
      key: "remedies",
      icon: "🌿",
      title: "Home Remedies",
      sub: "Natural illness solutions",
      colors: ["#166534", "#22C55E"],
      requiresLogin: false,
    },
    {
      key: "alzheimer",
      icon: "🧠",
      title: "Alzheimer Care",
      sub: "Patient & caregiver support",
      colors: ["#7C3AED", "#A78BFA"],
      requiresLogin: true,
    },
    {
      key: "elderly",
      icon: "👴",
      title: "Elderly Care",
      sub: "Health & memory tracking",
      colors: ["#B45309", "#F59E0B"],
      requiresLogin: true,
    },
    {
      key: "sensors",
      icon: "🚨",
      title: "Smart Sensors",
      sub: "Fall detection & alerts",
      colors: ["#DC2626", "#F87171"],
      requiresLogin: true,
    },
  ];

  // Check if user is caregiver or guardian and show their dashboard
  const showRoleDashboard = () => {
    if (user?.role === "caregiver") {
      router.push("home/caregiverDashboard");
    } else if (user?.role === "guardian") {
      router.push("home/guardianDashboard");
    } else if (user?.role === "patient") {
      if (user?.linkedPatientType === "elderly") {
        router.push("home/elderlyDashboard");
      } else {
        router.push("home/alzheimerDashboard");
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcome}>
                {isLoggedIn ? `Hello, ${user?.name || "User"}` : "Welcome to"}
              </Text>
              <Text style={styles.title}>HealthVerse</Text>
            </View>

            {isLoggedIn ? (
              <TouchableOpacity style={styles.avatarCircle} onPress={() => {
                Alert.alert(
                  "Account",
                  `${user?.name}\n${user?.email}\nRole: ${user?.role}`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Logout", onPress: logout, style: "destructive" },
                  ]
                );
              }}>
                <Text style={styles.avatarText}>
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.loginChip}
                onPress={() => router.push("/auth/login")}
              >
                <Text style={styles.loginChipText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Role-based dashboard shortcut */}
          {isLoggedIn && (user?.role === "caregiver" || user?.role === "guardian" || user?.role === "patient") && (
            <TouchableOpacity style={styles.roleBanner} onPress={showRoleDashboard}>
              <Text style={styles.roleBannerIcon}>
                {user.role === "caregiver" ? "👩‍⚕️" : user.role === "guardian" ? "👨‍👩‍👧" : "🧠"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleBannerTitle}>
                  {user.role === "caregiver"
                    ? "Caregiver Dashboard"
                    : user.role === "guardian"
                    ? "Guardian Dashboard"
                    : "Patient Dashboard"}
                </Text>
                <Text style={styles.roleBannerSub}>Tap to open your dashboard</Text>
              </View>
              <Text style={styles.roleBannerArrow}>→</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Healthcare Features</Text>
          <Text style={styles.sectionSub}>Explore our services</Text>

          {features.map((feature, index) => (
            <Animated.View
              key={feature.key}
              style={{
                opacity: cardAnims[index],
                transform: [
                  {
                    translateY: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => handleFeaturePress(feature.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIconBox, { backgroundColor: feature.colors[0] }]}>
                  <Text style={styles.cardIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{feature.title}</Text>
                  <Text style={styles.cardSub}>{feature.sub}</Text>
                </View>
                {feature.requiresLogin && !isLoggedIn && (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockText}>🔒</Text>
                  </View>
                )}
                <Text style={styles.cardArrow}>›</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Bottom spacing */}
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
    backgroundColor: "#1E40AF",
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    color: "#93C5FD",
    fontSize: 14,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loginChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  loginChipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  roleBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  roleBannerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  roleBannerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  roleBannerSub: {
    color: "#93C5FD",
    fontSize: 12,
    marginTop: 2,
  },
  roleBannerArrow: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F1F5F9",
  },
  cardSub: {
    color: "#64748B",
    marginTop: 3,
    fontSize: 13,
  },
  lockBadge: {
    marginRight: 8,
  },
  lockText: {
    fontSize: 14,
  },
  cardArrow: {
    color: "#475569",
    fontSize: 24,
    fontWeight: "300",
  },
});