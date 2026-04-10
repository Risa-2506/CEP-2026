import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from "react-native";
import { useRouter } from "expo-router";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Doctors() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const getIcon = (specialty) => {
    switch (specialty?.toLowerCase() || "") {
      case "cardiologist": return "❤️";
      case "neurologist": return "🧠";
      case "orthopedic": return "🦴";
      case "dentist": return "🦷";
      default: return "👨‍⚕️";
    }
  };

  const categories = [
    "All", "Cardiologist", "Neurologist", "Orthopedic", "Dermatologist",
    "Pediatrician", "Dentist", "ENT", "Gynecologist", "Psychiatrist",
    "Oncologist", "Endocrinologist", "General Physician", "Ophthalmologist",
    "Urologist", "Radiologist", "Pulmonologist", "Nephrologist",
    "Gastroenterologist", "Anesthesiologist", "Pathologist"
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${BASE_URL}/doctors`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else {
        setData([]); // In case of error response
      }
    } catch (err) {
      console.log("Error fetching doctors:", err);
      setData([]);
    }
  };

  const filteredDoctors = data.filter((d) => {
    const dName = d.name || "";
    const dSpec = d.specialty || "";

    const matchSearch =
      dName.toLowerCase().includes(search.toLowerCase()) ||
      dSpec.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "All" ||
      dSpec.toLowerCase() === category.toLowerCase();

    return matchSearch && matchCategory;
  });

  const renderDoctor = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>
            {getIcon(item.specialty)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <Text style={styles.rating}>⭐ 4.8 • 10 yrs exp</Text>
          <Text style={styles.location}>📍 {item.location || "Hospital"}</Text>
        </View>

        <View style={styles.available}>
          <Text style={{ color: "green", fontSize: 12 }}>Available</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.price}>₹500 / visit</Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.callBtn}>
            <Text style={styles.btnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.btnText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/*<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>*/}
            <View>
              <Text style={styles.headerTitle}>Find Doctors</Text>
              <Text style={styles.headerSub}>Search by specialization</Text>
            </View>
          </View>
        </View>

        {/* SEARCH */}
        <TextInput
          placeholder="Search doctor..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#94a3b8"
        />

        {/* CATEGORY */}
        <View style={{ height: 60, marginBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((cat) => {
              const isActive = category === cat;

              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryBtn,
                    isActive && styles.activeCategoryBtn
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && styles.activeCategoryText
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* COUNT */}
        <Text style={styles.count}>
          {filteredDoctors.length} doctors found
        </Text>

        {/* LIST */}
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderDoctor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f6fa"
  },
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 10
  },
  header: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center"
  },
  backButton: {
    marginRight: 15,
    paddingRight: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  backButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold"
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  headerSub: {
    color: "#c7d2fe",
    fontSize: 14,
    marginTop: 2
  },
  search: {
    backgroundColor: "#fff",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5
  },
  categoryBtn: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  activeCategoryBtn: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB"
  },
  categoryText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500"
  },
  activeCategoryText: {
    color: "#fff",
    fontWeight: "600"
  },
  count: {
    marginBottom: 10,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500"
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  iconText: {
    fontSize: 28
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2
  },
  specialty: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4
  },
  rating: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2
  },
  location: {
    fontSize: 12,
    color: "#64748b"
  },
  available: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9"
  },
  price: {
    fontWeight: "bold",
    color: "#0f172a",
    fontSize: 15
  },
  btnRow: {
    flexDirection: "row"
  },
  callBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10
  },
  bookBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14
  }
});