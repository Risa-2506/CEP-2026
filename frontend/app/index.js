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
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();

    // Staggered spring animations for cards
    const animations = cardAnims.map((anim, i) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200 + i * 100,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
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
          router.push(feature === "elderly" ? "/home/elderly-setup" : "/home/alzheimer-setup");
        } else {
          try {
            const endpoint = feature === "elderly" ? "/elderly/check" : "/alzheimer/check";
            const res = await fetch(`${BASE_URL}${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.hasProfile) {
              router.push(feature === "elderly" ? "/elderly" : "/alzheimer");
            } else {
              router.push(feature === "elderly" ? "/home/elderly-setup" : "/home/alzheimer-setup");
            }
          } catch (error) {
            router.push(feature === "elderly" ? "/home/elderly-setup" : "/home/alzheimer-setup");
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
      colors: ["#2563EB", "#60A5FA"],
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

  // Auth-aware navigation to specific dashboards
  const showRoleDashboard = () => {
    if (user?.role === "caregiver") {
      router.push("/caregiver");
    } else if (user?.role === "guardian") {
      router.push("/home/guardianDashboard");
    } else if (user?.role === "patient") {
      if (user?.linkedPatientType === "elderly") {
        router.push("/elderly");
      } else {
        router.push("/alzheimer");
      }
    } else {
      Alert.alert("No Dashboard", "You are not currently linked as a patient, caregiver, or guardian. Please set up a profile first.");
    }
  };

  const handleSyncRole = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/sync-role`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", "Your profile has been synchronized. If you are a caregiver, your dashboard should now be available.");
      } else {
        Alert.alert("Sync Error", data.message || "Could not sync role");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to reach server");
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
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity style={styles.syncBtn} onPress={handleSyncRole}>
                  <Text style={styles.syncBtnText}>🔄 Sync</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.avatarCircle} onPress={() => {
                  Alert.alert(
                    "Account",
                    `${user?.name}\n${user?.email}\nRole: ${user?.role}\nLinked to: ${user?.linkedPatientName || 'None'}`,
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
              </View>
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
    backgroundColor: "#F0F6FF",
  },
  header: {
    backgroundColor: "#0E7490",
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#0E7490",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    color: "#CFFAFE",
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  syncBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  syncBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loginChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  loginChipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  roleBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
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
    color: "#CFFAFE",
    fontSize: 12,
    marginTop: 2,
  },
  roleBannerArrow: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0E7490",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
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
    color: "#94A3B8",
    fontSize: 24,
    fontWeight: "300",
  },
});