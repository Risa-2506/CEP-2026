import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Doctors() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const getIcon = (specialty) => {
  switch (specialty.toLowerCase()) {
    case "cardiologist":
      return "❤️";
    case "neurologist":
      return "🧠";
    case "orthopedic":
      return "🦴";
    case "dentist":
      return "🦷";
    default:
      return "👨‍⚕️";
  }
};

  const categories = ["All", "Cardiologist", "Neurologist", "Orthopedic", "Dermatologist", "Pediatrician", "Dentist", "ENT", "Gynecologist", "Psychiatrist", "Oncologist","Endocrinologist", "General Physician", "Ophthalmologist", "Urologist", "Radiologist", "Pulmonologist", "Nephrologist","Gastroenterologist", "Anesthesiologist", "Pathologist"];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${BASE_URL}/doctors`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ FILTER LOGIC
  const filteredDoctors = data.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase());

const matchCategory =
  category === "All" ||
  d.specialty.toLowerCase() === category.toLowerCase();

    return matchSearch && matchCategory;
  });

  // ✅ DOCTOR CARD
  const renderDoctor = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* 👉 PUT ICON HERE (REPLACE IMAGE) */}
  <View style={styles.iconBox}>
    <Text style={styles.iconText}>
      {getIcon(item.specialty)}
    </Text>
  </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <Text style={styles.rating}>⭐ 4.8 • 10 yrs exp</Text>
          <Text style={styles.location}>📍 {item.location}</Text>
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
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Doctors</Text>
        <Text style={styles.headerSub}>Search by specialization</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Search doctor..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* CATEGORY */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
        style={{ maxHeight: 50 }}
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

      {/* COUNT */}
      <Text style={styles.count}>
        {filteredDoctors.length} doctors found
      </Text>

      {/* LIST */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item._id}
        renderItem={renderDoctor}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    padding: 15
  },

  header: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  headerSub: {
    color: "#c7d2fe"
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
    marginBottom: 10
  },

  // ✅ CATEGORY FIXED
  categoryContainer: {
  flexDirection: "row",
  alignItems: "center"
},

  categoryBtn: {
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },

  activeCategoryBtn: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB"
  },

  categoryText: {
    fontSize: 14,
    color: "#334155"
  },

  activeCategoryText: {
    color: "#fff",
    fontWeight: "600"
  },

  count: {
    marginVertical: 10,
    color: "#555"
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10
  },

  name: {
    fontSize: 16,
    fontWeight: "bold"
  },

  specialty: {
    color: "#2563EB"
  },

  rating: {
    fontSize: 12,
    color: "#555"
  },

  location: {
    fontSize: 12,
    color: "#777"
  },

  available: {
    backgroundColor: "#dcfce7",
    padding: 5,
    borderRadius: 10
  },

 bottomRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10
},

  price: {
    fontWeight: "bold",
    color: "#2563EB"
  },

  btnRow: {
    flexDirection: "row"
  },

  callBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10
  },

  bookBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20
  },

  btnText: {
    color: "#fff",
    fontWeight: "600"
  },
  iconBox: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#e0edff",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 10
},

iconText: {
  fontSize: 28
},
contact: {
  flex: 1,
  color: "#2563EB",
  fontSize: 14
}
});