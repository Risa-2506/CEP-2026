import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Remedies() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});

  const fetchRemedies = async (query = "") => {
    const url = query ? `${BASE_URL}?search=${query}` : BASE_URL;
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
  };

  const fetchDetails = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`);
    const json = await res.json();
    setDetails((prev) => ({ ...prev, [id]: json }));
  };

  useEffect(() => {
    fetchRemedies();
  }, []);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!details[id]) await fetchDetails(id);
    }
  };

  const renderItem = ({ item, index }) => {
    const colors = [
      "#E8F1FF",
      "#FDECEC",
      "#F3E8FF",
      "#FFF4E5",
      "#E6F7F1"
    ];

    return (
      <View style={[styles.card, { backgroundColor: colors[index % 5] }]}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.name}</Text>

            <View style={styles.tag}>
              <Text style={styles.tagText}>Natural</Text>
            </View>
          </View>

          <Text style={styles.subText}>
            {item.remedyCount} remedies available
          </Text>
        </TouchableOpacity>

        {expandedId === item.id && details[item.id] && (
          <View style={styles.dropdown}>
            {details[item.id].remedies.map((r, i) => (
              <View key={i} style={styles.remedyItem}>
                <View style={styles.circle}>
                  <Text style={styles.circleText}>{i + 1}</Text>
                </View>
                <Text style={styles.remedyText}>{r}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home Remedies</Text>
        <Text style={styles.headerSub}>Natural wellness solutions</Text>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search illness..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          fetchRemedies(text);
        }}
        style={styles.input}
      />

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🌿 Natural remedies for common illnesses.{"\n"}
          Consult a doctor for serious conditions.
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
    backgroundColor: "#16A34A",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  headerSub: {
    color: "#d1fae5",
    marginTop: 5
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 25,
    marginBottom: 15
  },

  infoBox: {
    backgroundColor: "#E6F7EC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15
  },
  infoText: {
    color: "#166534"
  },

  card: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 12
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  title: {
    fontSize: 18,
    fontWeight: "bold"
  },

  subText: {
    marginTop: 5,
    color: "#555"
  },

  tag: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600"
  },

  dropdown: {
    marginTop: 10
  },

  remedyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10
  },

  circle: {
    width: 25,
    height: 25,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },

  circleText: {
    color: "#fff",
    fontWeight: "bold"
  },

  remedyText: {
    flex: 1
  }
});