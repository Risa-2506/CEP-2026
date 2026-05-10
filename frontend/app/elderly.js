import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, SafeAreaView, Platform, StatusBar, KeyboardAvoidingView, Linking } from "react-native";
import Swiper from "react-native-deck-swiper";
import { elderlyAPI } from "../services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTTS } from "../hooks/useTTS";

// Demo stories used when database is empty
const DEMO_STORIES = [
  {
    id: "1",
    title: "The Broken Clock",
    teaser: "A man kept a broken clock for years... but one day it changed everything.",
    content: "A man owned a clock that stopped working. People mocked him, but he said it was still right twice a day. One day, he realized that even something imperfect has value.",
    moral: "You don’t have to be perfect to be valuable."
  },
  {
    id: "2",
    title: "The Old Tree",
    teaser: "Everyone ignored the old tree… until the storm came.",
    content: "A strong storm hit the village. The only thing that survived was the old tree everyone ignored. Its deep roots saved it.",
    moral: "Strength comes from experience, not appearance."
  },
  {
    id: "3",
    title: "The Empty Cup",
    teaser: "A master kept pouring tea into a full cup… why?",
    content: "A student came to learn. The master poured tea into his already full cup. The student protested. The master said: ‘You must empty your mind first.’",
    moral: "Be open to learning."
  }
];

const CITY_OPTIONS = [
  "Mumbai",
  "Pune",
  "Bangalore",
  "Delhi"
];

const TABS = [
  { key: "notepad", label: "Care Notes" },
  { key: "routines", label: "Routines" },
  { key: "contacts", label: "Contacts" },
  { key: "memory", label: "Memories" },
  { key: "inspirational", label: "Inspiration" },
  { key: "places", label: "Nearby" }
];

const COLORS = {
  bg: "#F5F7FB",
  card: "#FFFFFF",
  primary: "#2563EB",
  accent: "#38BDF8",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0"
};

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const Button = ({ label, onPress }) => (
  <Pressable style={styles.btn} onPress={onPress}>
    <Text style={styles.btnText}>{label}</Text>
  </Pressable>
);

const Input = (props) => (
  <TextInput
    {...props}
    placeholderTextColor="#94A3B8"
    style={[styles.input, props.multiline && styles.textArea, props.style]}
  />
);

export default function Elderly() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { speak, stop, isSpeaking } = useTTS();
  const [activeTab, setActiveTab] = useState(params.tab || "notepad");
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [memories, setMemories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [inspirationals, setInspirationals] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [forms, setForms] = useState({
    note: { title: "", content: "" },
    contact: { name: "", phone: "" },
    memory: { title: "", story: "" }
  });

  const setField = (form, key, val) => {
    setForms((prev) => ({
      ...prev,
      [form]: { ...prev[form], [key]: val }
    }));
  };

  const loadAll = useCallback(async () => {
    setLoading(true);

    const results = await Promise.allSettled([
      elderlyAPI.notepad.getAll(),
      elderlyAPI.contacts.getAll(),
      elderlyAPI.memories.getAll(),
      elderlyAPI.places.getNearby(),
      elderlyAPI.inspirationals.getAll(),
      elderlyAPI.tasks.getAll()
    ]);

    setNotes(results[0].value?.data || []);
    setContacts(results[1].value?.data || []);
    setMemories(results[2].value?.data || []);
    setPlaces(results[3].value?.data || []);
    setInspirationals(results[4].value?.data || []);
    setTasks(results[5].value?.data || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const renderNotepad = () => (
    <View style={styles.recordSection}>
      <View style={styles.sectionIntro}>
        <Text style={styles.sectionTitle}>Care Notes</Text>
        <Text style={styles.sectionSubtext}>Important instructions and records from your caregiver.</Text>
      </View>

      {notes.length === 0 ? (
        <Card style={styles.emptyStateBox}>
          <Text style={styles.emptyStateTitle}>No notes yet</Text>
          <Text style={styles.emptyStateText}>Your caregiver hasn't posted any notes for you yet.</Text>
        </Card>
      ) : (
        notes.map((n) => (
          <Card key={n._id} style={styles.listCard}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>{n.title}</Text>
              <View style={[styles.statusPill, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.statusPillText}>INSTRUCTION</Text>
              </View>
            </View>
            <Text style={styles.listText}>{n.content}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={styles.itemDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
              <Pressable onPress={() => speak(`${n.title}. ${n.content}`)} style={styles.ttsButtonSmall}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>🔊 Read Note</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </View>
  );

  const toggleTask = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    await elderlyAPI.tasks.updateStatus(task._id, newStatus);
    loadAll();
  };

  const addTask = async () => {
    if (!forms.task?.trim()) {
      return; 
    }
    try {
      await elderlyAPI.tasks.create({ text: forms.task });
      setForms(prev => ({ ...prev, task: "" }));
      loadAll();
    } catch (e) {
      console.log("Add task error", e);
    }
  };

  const deleteTask = async (id) => {
    try {
      await elderlyAPI.tasks.delete(id);
      loadAll();
    } catch (e) {
      console.log("Delete task error", e);
    }
  };

  const renderTasks = () => (
    <View style={styles.recordSection}>
      <View style={[styles.sectionIntro, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Daily Routine</Text>
          <Text style={styles.sectionSubtext}>Add and manage your daily tasks. Shared with caregiver.</Text>
        </View>
        <Pressable style={styles.readAllBtn} onPress={() => {
          if (tasks.length === 0) { speak('No routine tasks today!'); return; }
          let fullText = "Your daily tasks are: ";
          tasks.forEach((t, i) => {
            fullText += `${i+1}: ${t.text}. `;
          });
          speak(fullText);
        }}>
          <Text style={styles.readAllText}>🔊 Read All</Text>
        </Pressable>
      </View>

      <Card style={styles.formCard}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput 
            style={[styles.input, { flex: 1, marginBottom: 0 }]} 
            placeholder="New routine task..." 
            value={forms.task}
            onChangeText={(v) => setForms(prev => ({ ...prev, task: v }))}
          />
          <Pressable 
            style={[styles.btn, { paddingHorizontal: 15, justifyContent: 'center' }, !forms.task?.trim() && { opacity: 0.5 }]} 
            onPress={addTask}
            disabled={!forms.task?.trim()}
          >
            <Text style={styles.btnText}>Add</Text>
          </Pressable>
        </View>
      </Card>

      {tasks.length === 0 ? (
        <Card style={styles.emptyStateBox}>
          <Text style={styles.emptyStateTitle}>No routine tasks</Text>
          <Text style={styles.emptyStateText}>Add a task above or wait for your caregiver to set your routine.</Text>
        </Card>
      ) : (
        tasks.map((t) => (
          <Card key={t._id} style={[styles.listCard, t.status === "done" && { backgroundColor: "#F0FDFA", borderColor: "#5EEAD4" }]}>
            <View style={styles.listHeaderRow}>
              <Pressable onPress={() => toggleTask(t)} style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.listTitle, t.status === "done" && styles.textStrike]}>{t.text}</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => speak(t.text)} style={[styles.ttsButtonSmall, { padding: 8 }]}>
                  <Text style={{ fontSize: 16 }}>🔊</Text>
                </Pressable>
                <View style={[styles.statusPill, { backgroundColor: t.status === "done" ? "#10B981" : "#F59E0B" }]}>
                    <Text style={styles.statusPillText}>{t.status === "done" ? "DONE" : "PENDING"}</Text>
                </View>
                <Pressable onPress={() => deleteTask(t._id)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 18 }}>🗑️</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.subtext}>Tap text to toggle status</Text>
          </Card>
        ))
      )}
    </View>
  );

  const renderContacts = () => (
    <View style={styles.recordSection}>
      <View style={styles.sectionIntro}>
        <Text style={styles.sectionTitle}>Contact Diary</Text>
        <Text style={styles.sectionSubtext}>Keep trusted people and emergency numbers in one place.</Text>
      </View>

      <Card style={styles.formCard}>
        <Input placeholder="Name" value={forms.contact.name} onChangeText={(v) => setField("contact", "name", v)} />
        <Input placeholder="Phone" keyboardType="phone-pad" value={forms.contact.phone} onChangeText={(v) => setField("contact", "phone", v)} />
        <Button 
          label="Add Contact" 
          onPress={async () => {
            try {
              if (!forms.contact.name.trim()) {
                Alert.alert("Error", "Please enter a contact name.");
                return;
              }
              const phone = forms.contact.phone.replace(/[^0-9]/g, '');
              if (phone.length !== 10) {
                Alert.alert("Error", "Please enter a valid 10-digit phone number.");
                return;
              }
              await elderlyAPI.contacts.create({ ...forms.contact, phone });
              setForms((prev) => ({ ...prev, contact: { name: "", phone: "" } }));
              loadAll();
            } catch (e) {
              Alert.alert("Error", "Failed to save contact. Please try again.");
            }
          }} 
        />
      </Card>

      {contacts.map((c) => (
        <Card key={c._id} style={styles.listCard}>
          <View style={styles.listHeaderRow}>
            <View>
              <Text style={styles.listTitle}>{c.name}</Text>
              <Text style={styles.listText}>{c.phone}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={[styles.deletePill, { backgroundColor: '#10B981' }]} onPress={() => Linking.openURL(`tel:${c.phone}`)}>
                <Text style={styles.deletePillText}>Call</Text>
              </Pressable>
              <Pressable style={styles.deletePill} onPress={async () => { await elderlyAPI.contacts.delete(c._id); loadAll(); }}>
                <Text style={styles.deletePillText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderMemories = () => (
    <View style={styles.recordSection}>
      <View style={styles.sectionIntro}>
        <Text style={styles.sectionTitle}>Memory Lane</Text>
        <Text style={styles.sectionSubtext}>Preserve stories and moments that matter to you.</Text>
      </View>

      <Card style={styles.formCard}>
        <Input placeholder="Title" value={forms.memory.title} onChangeText={(v) => setField("memory", "title", v)} />
        <Input multiline placeholder="Story" value={forms.memory.story} onChangeText={(v) => setField("memory", "story", v)} />
        <Button label="Save Memory" onPress={async () => {
          if (!forms.memory.title.trim() || !forms.memory.story.trim()) return;
          await elderlyAPI.memories.create(forms.memory);
          setForms((prev) => ({ ...prev, memory: { title: "", story: "" } }));
          loadAll();
        }} />
      </Card>

      {memories.map((m) => (
        <Card key={m._id} style={styles.listCard}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>{m.title}</Text>
            <Pressable style={styles.deletePill} onPress={async () => { await elderlyAPI.memories.delete(m._id); loadAll(); }}>
              <Text style={styles.deletePillText}>Delete</Text>
            </Pressable>
          </View>
          <Text style={styles.listText}>{m.story}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pressable onPress={() => speak(`${m.title}. ${m.story}`)} style={styles.ttsButtonSmall}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>🔊 Read Memory</Text>
              </Pressable>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderInspiration = () => {
    const storyCards = inspirationals.length ? inspirationals.map(i => ({
      id: i._id, title: i.title, teaser: i.teaser || i.content?.slice(0, 90), 
      content: i.content || i.text, moral: i.moral || i.source || "Stay positive!"
    })) : DEMO_STORIES;

    return (
      <View style={styles.inspirationSection}>
        <View style={styles.inspirationHeaderBox}>
          <Text style={styles.inspirationSectionTitle}>Daily Inspiration</Text>
          <Text style={styles.inspirationSectionSubtext}>Positive thoughts for a better day.</Text>
        </View>
        <View style={styles.inspirationSwiperWrap}>
          <Swiper
            cards={storyCards}
            renderCard={(card) => card ? (
              <View style={styles.inspirationCard}>
                <Text style={styles.inspirationCardLabel}>Story</Text>
                <Text style={styles.inspirationTitle}>{card.title}</Text>
                <Text style={styles.inspirationTeaser}>{card.teaser}</Text>
                <Pressable
                  onPress={() => setSelectedStory(card)}
                  style={{ marginTop: 14, backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 22, alignSelf: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>📖 View Full Story</Text>
                </Pressable>
              </View>
            ) : null}
            onTapCard={(idx) => setSelectedStory(storyCards[idx])}
            stackSize={3} backgroundColor="transparent"
          />
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "notepad": return renderNotepad();
      case "routines": return renderTasks();
      case "contacts": return renderContacts();
      case "memory": return renderMemories();
      case "inspirational": return renderInspiration();
      case "places": return (
        <View>
          <Text style={styles.sectionTitle}>Find Nearby Places</Text>
          <View style={styles.cityGrid}>
            {CITY_OPTIONS.map(city => (
              <Pressable key={city} style={[styles.cityCard, selectedCity === city && styles.cityCardSelected]} 
                onPress={async () => { setSelectedCity(city); const res = await elderlyAPI.places.getNearby(city); setPlaces(res.data || []); }}>
                <Text style={[styles.cityCardTitle, selectedCity === city && styles.cityCardTitleSelected]}>{city}</Text>
              </Pressable>
            ))}
          </View>
          {places.map(p => (
            <Card key={p._id}>
              <Text style={styles.placeName}>{p.name}</Text>
              <Text style={styles.placeAddress}>{p.address}</Text>
            </Card>
          ))}
        </View>
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - outside ScrollView to avoid gap */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/")} style={styles.backButton}>
          <Text style={styles.backButtonIcon}>← Home</Text>
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>ElderCare</Text>
          <Text style={styles.headerSub}>Health • Comfort • Care</Text>
        </View>
        {isSpeaking && (
          <Pressable onPress={stop} style={styles.stopButton}>
            <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '700' }}>⏹ Stop</Text>
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.tabActive
                ]}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive
                ]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <View style={{ marginTop: 10 }}>{renderContent()}</View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Story Modal */}
      <Modal visible={!!selectedStory} transparent animationType="fade" onRequestClose={() => setSelectedStory(null)}>
        <View style={styles.storyModalBackdrop}>
          <View style={styles.storyBox}>
            <View style={styles.storyHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <Text style={styles.storyTitle}>{selectedStory?.title}</Text>
                <Pressable onPress={() => speak(`${selectedStory?.title}. ${selectedStory?.content}. The Lesson: ${selectedStory?.moral}`)} style={styles.ttsButtonSmall}>
                  <Text style={{ fontSize: 16 }}>🔊</Text>
                </Pressable>
              </View>
              <Pressable style={styles.closeBtn} onPress={() => { setSelectedStory(null); stop(); }}>
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.storyScrollArea}>
              <Text style={styles.storyContent}>{selectedStory?.content}</Text>
              <View style={styles.moralPill}>
                <Text style={styles.moralLabel}>The Lesson</Text>
                <Text style={styles.moralText}>{selectedStory?.moral}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12
  },
  backButtonIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  headerTextContainer: {
    flex: 1
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700"
  },
  headerSub: {
    color: "#E0F2FE",
    marginTop: 4
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 12,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tabActive: {
    backgroundColor: COLORS.primary
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    width: "100%",
    minHeight: 48,
    padding: 12,
    marginBottom: 10,
    color: COLORS.text
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600"
  },
  recordSection: {
    marginTop: 2
  },
  sectionIntro: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 20,
    color: "#0F172A",
    fontWeight: "700",
    marginBottom: 4
  },
  sectionSubtext: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 19
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FBFF",
    padding: 16
  },
  listCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16
  },
  listTitle: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 16,
    marginBottom: 4
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2
  },
  listText: {
    color: "#475569",
    lineHeight: 21,
    fontSize: 14
  },
  itemDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6
  },
  deletePill: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  deletePillText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700"
  },
  emptyStateBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 14,
    marginTop: 2
  },
  emptyStateTitle: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4
  },
  emptyStateText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10
  },
  cityCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center"
  },
  cityCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  cityCardTitle: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "700"
  },
  cityCardTitleSelected: {
    color: "#FFFFFF"
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4
  },
  placeAddress: {
    color: COLORS.muted,
    fontSize: 13
  },
  inspirationSection: {
    paddingTop: 2
  },
  inspirationHeaderBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 14,
    marginBottom: 12
  },
  inspirationSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4
  },
  inspirationSectionSubtext: {
    color: "#475569",
    fontSize: 13
  },
  inspirationSwiperWrap: {
    height: 360
  },
  inspirationCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    height: 320,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    elevation: 5
  },
  inspirationCardLabel: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12
  },
  inspirationTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A"
  },
  inspirationTeaser: {
    marginTop: 14,
    fontSize: 16,
    color: "#334155",
    flex: 1
  },
  inspirationHint: {
    marginTop: 16,
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 13
  },
  storyModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  storyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "80%"
  },
  storyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  closeBtn: {
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  closeBtnText: {
    color: "#1D4ED8",
    fontWeight: "700"
  },
  storyTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A"
  },
  storyContent: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155"
  },
  storyScrollArea: {
    flex: 1
  },
  moralPill: {
    marginTop: 20,
    backgroundColor: "#F0F9FF",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  },
  moralLabel: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4
  },
  moralText: {
    color: "#1E40AF",
    fontWeight: "600"
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999
  },
  statusPillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900"
  },
  textStrike: {
    textDecorationLine: "line-through",
    color: "#94A3B8"
  },
  subtext: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2
  },
  storyModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  storyBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  storyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  closeBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  storyScrollArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  storyContent: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
    marginBottom: 20,
  },
  moralPill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  moralLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  moralText: {
    fontSize: 15,
    color: '#1E40AF',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  ttsButtonSmall: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center' },
  stopButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FEF2F2', borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5' },
  langButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  langButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  readAllBtn: { flexDirection: 'row', backgroundColor: '#EEF2FF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE' },
  readAllText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
});