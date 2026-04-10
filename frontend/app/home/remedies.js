import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.227.184.79:5000";

export default function Remedies() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});
  const [error, setError] = useState("");

  const fetchRemedies = async (query = "") => {
    try {
      const url = query ? `${BASE_URL}/remedies?search=${query}` : `${BASE_URL}/remedies`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setError("");
    } catch (err) {
      console.error("Fetch remedies failed", err);
      setError("Unable to load remedies. Check backend URL or network.");
      setData([]);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/remedies/${id}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setDetails((prev) => ({ ...prev, [id]: json }));
    } catch (err) {
      console.error("Fetch remedy details failed", err);
      setError("Unable to load remedy details. Please try again.");
    }
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

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.urlBox}>
        <Text style={styles.urlLabel}>Connected API URL</Text>
        <Text style={styles.urlValue}>{BASE_URL || "Not set"}</Text>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No remedies available yet.</Text>
        )}
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

  urlBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  urlLabel: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase"
  },
  urlValue: {
    color: "#1E3A8A",
    fontWeight: "600"
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
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15
  },

  errorText: {
    color: "#991b1b"
  },

  emptyText: {
    color: "#555",
    textAlign: "center",
    marginTop: 20
  }
});