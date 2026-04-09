import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, SafeAreaView, Platform, StatusBar } from "react-native";
import Swiper from "react-native-deck-swiper";
import { elderlyAPI } from "../services/api";
import { useLocalSearchParams, useRouter } from "expo-router";

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
  { key: "notepad", label: "Notes" },
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
  const [activeTab, setActiveTab] = useState(params.tab || "notepad");
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [memories, setMemories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [inspirationals, setInspirationals] = useState([]);

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
      elderlyAPI.inspirationals.getAll()
    ]);

    setNotes(results[0].value?.data || []);
    setContacts(results[1].value?.data || []);
    setMemories(results[2].value?.data || []);
    setPlaces(results[3].value?.data || []);
    setInspirationals(results[4].value?.data || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const content = useMemo(() => {
    switch (activeTab) {

      case "notepad":
        return (
          <View style={styles.recordSection}>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>My Notes</Text>
              <Text style={styles.sectionSubtext}>Capture reminders, thoughts, and important details.</Text>
            </View>

            <Card style={styles.formCard}>
              <Input placeholder="Title"
                value={forms.note.title}
                onChangeText={(v) => setField("note", "title", v)} />
              <Input multiline placeholder="Write note..."
                value={forms.note.content}
                onChangeText={(v) => setField("note", "content", v)} />
              <Button label="Save Note" onPress={async () => {
                await elderlyAPI.notepad.create(forms.note);
                setForms((prev) => ({
                  ...prev,
                  note: { title: "", content: "" }
                }));
                loadAll();
              }} />
            </Card>

            {notes.length ? (
              notes.map((n) => (
                <Card key={n._id} style={styles.listCard}>
                  <View style={styles.listHeaderRow}>
                    <Text style={styles.listTitle}>{n.title}</Text>
                    <Pressable
                      style={styles.deletePill}
                      onPress={async () => {
                        await elderlyAPI.notepad.delete(n._id);
                        await loadAll();
                      }}
                    >
                      <Text style={styles.deletePillText}>Delete</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.listText}>{n.content}</Text>
                </Card>
              ))
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateTitle}>No notes yet</Text>
                <Text style={styles.emptyStateText}>Add your first note using the form above.</Text>
              </View>
            )}
          </View>
        );

      case "contacts":
        return (
          <View style={styles.recordSection}>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Contact Diary</Text>
              <Text style={styles.sectionSubtext}>Keep trusted people and emergency numbers in one place.</Text>
            </View>

            <Card style={styles.formCard}>
              <Input placeholder="Name"
                value={forms.contact.name}
                onChangeText={(v) => setField("contact", "name", v)} />
              <Input placeholder="Phone"
                value={forms.contact.phone}
                onChangeText={(v) => setField("contact", "phone", v)} />
              <Button label="Add Contact" onPress={async () => {
                await elderlyAPI.contacts.create(forms.contact);
                setForms((prev) => ({
                  ...prev,
                  contact: { name: "", phone: "" }
                }));
                loadAll();
              }} />
            </Card>

            {contacts.length ? (
              contacts.map((c) => (
                <Card key={c._id} style={styles.listCard}>
                  <View style={styles.listHeaderRow}>
                    <Text style={styles.listTitle}>{c.name}</Text>
                    <Pressable
                      style={styles.deletePill}
                      onPress={async () => {
                        await elderlyAPI.contacts.delete(c._id);
                        await loadAll();
                      }}
                    >
                      <Text style={styles.deletePillText}>Delete</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.listText}>{c.phone}</Text>
                </Card>
              ))
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateTitle}>No contacts yet</Text>
                <Text style={styles.emptyStateText}>Add a contact so you can reach them quickly.</Text>
              </View>
            )}
          </View>
        );

      case "memory":
        return (
          <View style={styles.recordSection}>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Memory Lane</Text>
              <Text style={styles.sectionSubtext}>Preserve stories and moments that matter to you.</Text>
            </View>

            <Card style={styles.formCard}>
              <Input placeholder="Title"
                value={forms.memory.title}
                onChangeText={(v) => setField("memory", "title", v)} />
              <Input multiline placeholder="Story"
                value={forms.memory.story}
                onChangeText={(v) => setField("memory", "story", v)} />
              <Button label="Save Memory" onPress={async () => {
                await elderlyAPI.memories.create(forms.memory);
                setForms((prev) => ({
                  ...prev,
                  memory: { title: "", story: "" }
                }));
                loadAll();
              }} />
            </Card>

            {memories.length ? (
              memories.map((m) => (
                <Card key={m._id} style={styles.listCard}>
                  <View style={styles.listHeaderRow}>
                    <Text style={styles.listTitle}>{m.title}</Text>
                    <Pressable
                      style={styles.deletePill}
                      onPress={async () => {
                        await elderlyAPI.memories.delete(m._id);
                        await loadAll();
                      }}
                    >
                      <Text style={styles.deletePillText}>Delete</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.listText}>{m.story}</Text>
                </Card>
              ))
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateTitle}>No memories yet</Text>
                <Text style={styles.emptyStateText}>Write your first memory to start your collection.</Text>
              </View>
            )}
          </View>
        );

      // ✅ NEW SWIPE FEATURE HERE (ONLY CHANGE)
      case "inspirational":
        const storyCards = inspirationals.length
          ? inspirationals.map((item) => {
              const fullContent = item.content || item.text || "";
              const teaserText = item.teaser
                || (fullContent.length > 90 ? `${fullContent.slice(0, 90)}...` : fullContent);

              return {
                id: item._id,
                title: item.title,
                teaser: teaserText,
                content: fullContent,
                moral: item.moral || item.source || "Stay inspired every day."
              };
            })
          : DEMO_STORIES;

        return (
          <View style={styles.inspirationSection}>
            <View style={styles.inspirationHeaderBox}>
              <Text style={styles.inspirationSectionTitle}>Daily Inspiration</Text>
              <Text style={styles.inspirationSectionSubtext}>
                Read, reflect, and carry one positive thought through your day.
              </Text>
            </View>

            <View style={styles.inspirationSwiperWrap}>
              <Swiper
                cards={storyCards}
                renderCard={(card) => {
                  if (!card) return null;
                  return (
                    <View style={styles.inspirationCard}>
                      <Text style={styles.inspirationCardLabel}>Featured Story</Text>
                      <Text style={styles.inspirationTitle}>
                        {card.title}
                      </Text>

                      <Text style={styles.inspirationTeaser}>
                        {card.teaser}
                      </Text>

                      <Text style={styles.inspirationHint}>
                        Tap to read full story
                      </Text>
                    </View>
                  );
                }}
                onTapCard={(index) => {
                  const card = storyCards[index];
                  if (card) {
                    setSelectedStory(card);
                  }
                }}
                stackSize={3}
                backgroundColor="transparent"
              />
            </View>

            {!inspirationals.length ? (
              <View style={styles.emptyInspirationBox}>
                <Text style={styles.emptyInspirationText}>No inspirational stories found in MongoDB yet.</Text>
                <Pressable
                  style={styles.btn}
                  onPress={async () => {
                    await elderlyAPI.inspirationals.save({
                      title: DEMO_STORIES[0].title,
                      text: DEMO_STORIES[0].content,
                      source: DEMO_STORIES[0].moral,
                      category: "quote"
                    });
                    await loadAll();
                  }}
                >
                  <Text style={styles.btnText}>Create Demo Story In MongoDB</Text>
                </Pressable>
              </View>
            ) : null}

            {selectedStory ? (
              <Modal transparent animationType="fade" visible={Boolean(selectedStory)}>
                <View style={styles.storyModalBackdrop}>
                  <View style={styles.storyBox}>
                    <View style={styles.storyHeaderRow}>
                      <Text style={styles.storyTitle}>{selectedStory.title}</Text>
                      <Pressable onPress={() => setSelectedStory(null)} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>Close</Text>
                      </Pressable>
                    </View>
                    <ScrollView style={styles.storyScrollArea} showsVerticalScrollIndicator={false}>
                      <Text style={styles.storyContent}>{selectedStory.content}</Text>
                      <View style={styles.moralPill}>
                        <Text style={styles.moralLabel}>Moral</Text>
                        <Text style={styles.moralText}>{selectedStory.moral}</Text>
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            ) : null}
          </View>
        );

      case "places":
        return (
          <>
            <View style={styles.citySection}>
              <Text style={styles.citySectionTitle}>Find Places Near You</Text>
              <View style={styles.cityGrid}>
                {CITY_OPTIONS.map((cityName) => {
                  const isSelected = selectedCity === cityName;
                  return (
                    <Pressable
                      key={cityName}
                      style={[
                        styles.cityCard,
                        isSelected && styles.cityCardSelected
                      ]}
                      onPress={async () => {
                        setSelectedCity(cityName);
                        const res = await elderlyAPI.places.getNearby(cityName);
                        setPlaces(res.data || []);
                      }}
                    >
                      <Text style={[
                        styles.cityCardTitle,
                        isSelected && styles.cityCardTitleSelected
                      ]}>
                        {cityName}
                      </Text>
                      <Text style={[
                        styles.cityCardText,
                        isSelected && styles.cityCardTextSelected
                      ]}>
                        {isSelected ? "✓ Selected" : "Tap here"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {selectedCity ? (
              <View style={styles.cityResultHeader}>
                <View style={styles.resultHeaderContent}>
                  <View style={styles.resultTitleRow}>
                    <Text style={styles.cityResultTitle}>Places in {selectedCity}</Text>
                  </View>
                  <Text style={styles.cityResultSubtext}>
                    Tap another city to see different places
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Places List */}
            {places.length ? (
              places.map((p) => (
                <Card key={p._id}>
                  <View style={styles.placeCardContent}>
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>{p.name}</Text>
                      <View style={styles.placeAddressRow}>
                        <Text style={styles.placeAddress}>{p.address}</Text>
                      </View>
                      {p.city ? (
                        <View style={styles.placeCityBadge}>
                          <Text style={styles.placeCityBadgeText}>{p.city}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))
            ) : selectedCity ? (
              <View style={styles.emptyPlacesBox}>
                <Text style={styles.emptyPlacesTitle}>No places found</Text>
                <Text style={styles.emptyPlacesText}>
                  No places available in {selectedCity} yet. Check back soon!
                </Text>
              </View>
            ) : null}
          </>
        );

      default:
        return null;
    }
  }, [activeTab, notes, contacts, memories, places, inspirationals, forms, selectedStory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonIcon}>←</Text>
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>ElderCare</Text>
            <Text style={styles.headerSub}>Health • Comfort • Care</Text>
          </View>
        </View>

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
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <View style={{ marginTop: 10 }}>{content}</View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center"
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
    marginBottom: 10
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tabActive: {
    backgroundColor: COLORS.primary
  },
  tabText: {
    color: COLORS.muted
  },
  tabTextActive: {
    color: "#fff"
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
  title: {
    fontWeight: "700",
    color: COLORS.text,
    fontSize: 16
  },
  text: {
    color: COLORS.muted,
    marginTop: 4
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
  citySection: {
    marginBottom: 20,
    backgroundColor: "rgba(37, 99, 235, 0.05)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)"
  },
  citySectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  cityCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3
  },
  cityEmoji: {
    fontSize: 32,
    marginBottom: 8
  },
  cityCardTitle: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4
  },
  cityCardTitleSelected: {
    color: "#FFFFFF"
  },
  cityCardText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16
  },
  cityCardTextSelected: {
    color: "rgba(255, 255, 255, 0.9)"
  },
  cityResultHeader: {
    marginBottom: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3
  },
  resultHeaderContent: {
    flex: 1
  },
  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  resultHeaderIcon: {
    fontSize: 24,
    marginRight: 10
  },
  cityResultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1
  },
  cityResultSubtext: {
    marginTop: 4,
    color: "#E0F2FE",
    fontSize: 13,
    lineHeight: 18
  },
  placeCardContent: {
    flex: 1
  },
  placeInfo: {
    flex: 1
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6
  },
  placeAddressRow: {
    marginBottom: 10
  },
  placeAddress: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18
  },
  placeCityBadge: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  placeCityBadgeText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 12
  },
  emptyPlacesBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FBBF24",
    padding: 18,
    marginTop: 8,
    alignItems: "center"
  },
  emptyPlacesTitle: {
    color: "#92400E",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 6
  },
  emptyPlacesText: {
    color: "#B45309",
    lineHeight: 18,
    textAlign: "center"
  },
  placeCity: {
    marginTop: 6,
    color: "#1D4ED8",
    fontWeight: "600"
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
    marginBottom: 12,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  inspirationSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4
  },
  inspirationSectionSubtext: {
    color: "#475569",
    lineHeight: 20,
    fontSize: 13
  },
  inspirationSwiperWrap: {
    height: 360,
    marginBottom: 6
  },
  inspirationCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 20,
    height: 320,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    shadowColor: "#1D4ED8",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 7
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
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 12
  },
  inspirationTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 30
  },
  inspirationTeaser: {
    marginTop: 14,
    fontSize: 16,
    color: "#334155",
    lineHeight: 25,
    flex: 1
  },
  inspirationHint: {
    marginTop: 16,
    color: "#1D4ED8",
    textAlign: "left",
    fontWeight: "700",
    fontSize: 13
  },
  emptyInspirationBox: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  emptyInspirationText: {
    color: "#334155",
    marginBottom: 12,
    lineHeight: 20,
    fontSize: 14
  },
  storyModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  storyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 20,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12
  },
  storyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  closeBtn: {
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  closeBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12
  },
  storyTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10
  },
  storyContent: {
    fontSize: 15,
    lineHeight: 25,
    color: "#334155"
  },
  storyScrollArea: {
    maxHeight: 380
  },
  moralPill: {
    marginTop: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#93C5FD",
    padding: 14
  },
  moralLabel: {
    color: "#1D4ED8",
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    fontSize: 12
  },
  moralText: {
    color: "#1E40AF",
    fontWeight: "600"
  }
});