import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, SafeAreaView, Platform, StatusBar, TouchableOpacity, TextInput, Alert, Image, KeyboardAvoidingView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { alzheimerAPI, elderlyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from 'expo-image-picker';

const ALZ_TABS = [
  { key: "notes", label: "Care Notes" },
  { key: "tasks", label: "Shared Routine" },
  { key: "private", label: "My Planning (Private)" },
  { key: "game", label: "Memory Manager" },
  { key: "contacts", label: "Contacts" }
];

const ELD_TABS = [
  { key: "notes", label: "Care Notes" },
  { key: "tasks", label: "Routines" },
  { key: "contacts", label: "Contacts" },
  { key: "memories", label: "Memories" }
];

const COLORS = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  primary: "#0E7490", 
  accent: "#06B6D4",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  danger: "#EF4444",
  success: "#10B981"
};

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const Input = (props) => (
  <TextInput
    {...props}
    placeholderTextColor="#94A3B8"
    style={[styles.input, props.multiline && styles.textArea, props.style]}
  />
);

export default function CaregiverPanel() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isElderly = user?.linkedPatientType === "elderly";
  const tabs = isElderly ? ELD_TABS : ALZ_TABS;

  const [activeTab, setActiveTab] = useState(params.tab || "notes");
  const [loading, setLoading] = useState(false);

  // Data states
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [memories, setMemories] = useState([]); 
  const [eldTasks, setEldTasks] = useState([]);

  // Form states
  const [noteText, setNoteText] = useState("");
  const [noteTitle, setNoteTitle] = useState(""); 
  const [taskText, setTaskText] = useState("");
  const [privateTaskText, setPrivateTaskText] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", phone: "", relation: "" });
  const [gameForm, setGameForm] = useState({ question: "", image: "", opt1: "", opt2: "", opt3: "", opt4: "", correct: "" });
  const [memoryForm, setMemoryForm] = useState({ title: "", story: "" });
  const [eldTaskText, setEldTaskText] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      if (isElderly) {
        const [notesRes, contactsRes, memoriesRes, tasksRes] = await Promise.all([
          elderlyAPI.notepad.getAll(),
          elderlyAPI.contacts.getAll(),
          elderlyAPI.memories.getAll(),
          elderlyAPI.tasks.getAll()
        ]);
        if (notesRes.success) setNotes(notesRes.data || []);
        if (contactsRes.success) setContacts(contactsRes.data || []);
        if (memoriesRes.success) setMemories(memoriesRes.data || []);
        if (tasksRes.success) setEldTasks(tasksRes.data || []);
      } else {
        const [notesRes, tasksRes, contactsRes, gameRes, resultsRes] = await Promise.all([
          alzheimerAPI.notes.getAll(),
          alzheimerAPI.tasks.getAll(),
          alzheimerAPI.contacts.getAll(),
          alzheimerAPI.game.getAllQuestions(),
          alzheimerAPI.game.getResults()
        ]);

        if (notesRes.success) setNotes(notesRes.notes || []);
        if (tasksRes.success) setTasks(tasksRes.tasks || []);
        if (contactsRes.success) setContacts(contactsRes.contacts || []);
        if (gameRes.success) setQuestions(gameRes.questions || []);
        if (resultsRes.success) setResults(resultsRes.results || []);
      }
    } catch (error) {
      console.log("Error loading caregiver data", error);
    } finally {
      setLoading(false);
    }
  }, [isElderly]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Handlers
  const addNote = async () => {
    if (isElderly) {
        if (!noteTitle.trim() || !noteText.trim()) {
            Alert.alert("Error", "Title and Content are required for elderly notes.");
            return;
        }
        await elderlyAPI.notepad.create({ title: noteTitle, content: noteText });
        setNoteTitle("");
    } else {
        if (!noteText.trim()) return;
        await alzheimerAPI.notes.create({ text: noteText });
    }
    setNoteText("");
    loadAll();
  };

  const deleteNote = async (id) => {
    if (isElderly) await elderlyAPI.notepad.delete(id);
    else await alzheimerAPI.notes.delete(id);
    loadAll();
  };

  const addTask = async (isPrivate = false) => {
    const text = isPrivate ? privateTaskText : taskText;
    if (!text.trim()) return;
    
    await alzheimerAPI.tasks.create({ text, isPrivate });
    if (isPrivate) setPrivateTaskText("");
    else setTaskText("");
    loadAll();
  };

  const deleteTask = async (id) => {
    await alzheimerAPI.tasks.delete(id);
    loadAll();
  };

  const addContact = async () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      Alert.alert("Error", "Name and Phone are required.");
      return;
    }
    if (isElderly) await elderlyAPI.contacts.create(contactForm);
    else await alzheimerAPI.contacts.create(contactForm);
    setContactForm({ name: "", phone: "", relation: "" });
    loadAll();
  };

  const deleteContact = async (id) => {
    if (isElderly) await elderlyAPI.contacts.delete(id);
    else await alzheimerAPI.contacts.delete(id);
    loadAll();
  };

  const addMemory = async () => {
    if (!memoryForm.title.trim() || !memoryForm.story.trim()) {
      Alert.alert("Error", "Title and Story are required.");
      return;
    }
    await elderlyAPI.memories.create(memoryForm);
    setMemoryForm({ title: "", story: "" });
    loadAll();
  };

  const deleteMemory = async (id) => {
    await elderlyAPI.memories.delete(id);
    loadAll();
  };

  const addEldTask = async () => {
    if (!eldTaskText.trim()) return;
    await elderlyAPI.tasks.create({ text: eldTaskText });
    setEldTaskText("");
    loadAll();
  };

  const deleteEldTask = async (id) => {
    await elderlyAPI.tasks.delete(id);
    loadAll();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setGameForm(prev => ({ ...prev, image: base64Uri }));
    } else if (!result.canceled && result.assets) {
        setGameForm(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const addGameQuestion = async () => {
    if (!gameForm.question || !gameForm.opt1 || !gameForm.opt2 || !gameForm.correct) {
      Alert.alert("Missing Fields", "Fill in question, 2+ options, and correct answer.");
      return;
    }
    const options = [gameForm.opt1, gameForm.opt2, gameForm.opt3, gameForm.opt4].filter(x => x && x.trim().length > 0);
    if (!options.includes(gameForm.correct)) {
        Alert.alert("Error", "Correct Answer must exactly match one of the options.");
        return;
    }
    try {
      await alzheimerAPI.game.createQuestion({
        question: gameForm.question,
        options,
        correctAnswer: gameForm.correct,
        image: gameForm.image
      });
      setGameForm({ question: "", image: "", opt1: "", opt2: "", opt3: "", opt4: "", correct: "" });
      Alert.alert("Success", "Question added!");
      loadAll();
    } catch (e) {
      console.log("Game add error", e);
    }
  };

  const renderAlzNotes = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Instructions for Patient</Text>
        <Input multiline placeholder="Guidance or reminders for the patient..." value={noteText} onChangeText={setNoteText} />
        <TouchableOpacity style={styles.btnPrimary} onPress={addNote}>
            <Text style={styles.btnText}>Post Note</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.listSectionTitle}>Active Note Log</Text>
      {notes.map(n => (
        <Card key={n._id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.itemDate}>Note • {new Date(n.createdAt).toLocaleDateString()}</Text>
                <View style={[styles.statusTag, n.status === 'completed' && { backgroundColor: COLORS.success }]}>
                    <Text style={styles.statusTagText}>{n.status?.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={[styles.itemText, n.status === 'completed' && styles.textStrike]}>{n.text}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteNote(n._id)} style={styles.delBtn}>
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderAlzRoutine = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Shared Routine Tasks</Text>
        <Input placeholder="Shared task (e.g. Eat breakfast)" value={taskText} onChangeText={setTaskText} />
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: COLORS.accent }]} onPress={() => addTask(false)}>
          <Text style={styles.btnText}>Add to Routine</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.listSectionTitle}>Current Shared Routine</Text>
      {tasks.filter(t => !t.isPrivate).map(t => (
        <Card key={t._id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemDate, { color: COLORS.accent }]}>Task • Status: {t.status}</Text>
            <Text style={[styles.itemText, t.status === 'done' && styles.textStrike]}>{t.text}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteTask(t._id)} style={styles.delBtn}>
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderAlzPrivate = () => (
    <View>
      <Card style={[styles.formCard, { backgroundColor: "#FDF2F8", borderColor: "#FBCFE8" }]}>
        <Text style={[styles.formTitle, { color: "#BE185D" }]}>Private Caregiver Tasks</Text>
        <Text style={styles.subText}>Only you can see these tasks.</Text>
        <View style={{ height: 10 }} />
        <Input placeholder="Personal reminder (e.g., Appointment)" value={privateTaskText} onChangeText={setPrivateTaskText} />
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: "#BE185D" }]} onPress={() => addTask(true)}>
          <Text style={styles.btnText}>Save Private Task</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.listSectionTitle}>My Private Planning</Text>
      {tasks.filter(t => t.isPrivate).map(t => (
        <Card key={t._id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemDate, { color: "#BE185D" }]}>Private • Status: {t.status}</Text>
            <Text style={[styles.itemText, t.status === 'done' && styles.textStrike]}>{t.text}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteTask(t._id)} style={styles.delBtn}>
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderAlzGame = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Manage Memory Game</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <Input 
                placeholder="Image URL" 
                style={{ flex: 1, marginBottom: 0 }} 
                value={gameForm.image} 
                onChangeText={t => setGameForm({ ...gameForm, image: t })} 
            />
            <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
                <Text style={styles.pickBtnText}>Gallery</Text>
            </TouchableOpacity>
        </View>

        {gameForm.image.trim() ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
                source={{ uri: gameForm.image }} 
                style={styles.previewImage} 
                resizeMode="cover"
                onError={() => Alert.alert("Image Error", "This image format is not supported or the URL is invalid. Try using the Gallery button.")} 
            />
          </View>
        ) : (
          <View style={styles.imagePlaceholder}><Text style={styles.mutedText}>Image Preview</Text></View>
        )}
        <Input placeholder="Memory Question" value={gameForm.question} onChangeText={t => setGameForm({ ...gameForm, question: t })} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Input placeholder="Opt 1" style={{ flex: 1 }} value={gameForm.opt1} onChangeText={t => setGameForm({ ...gameForm, opt1: t })} />
          <Input placeholder="Opt 2" style={{ flex: 1 }} value={gameForm.opt2} onChangeText={t => setGameForm({ ...gameForm, opt2: t })} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Input placeholder="Opt 3" style={{ flex: 1 }} value={gameForm.opt3} onChangeText={t => setGameForm({ ...gameForm, opt3: t })} />
          <Input placeholder="Opt 4" style={{ flex: 1 }} value={gameForm.opt4} onChangeText={t => setGameForm({ ...gameForm, opt4: t })} />
        </View>
        <Input placeholder="Exact Correct Answer" value={gameForm.correct} onChangeText={t => setGameForm({ ...gameForm, correct: t })} />
        <TouchableOpacity style={styles.btnPrimary} onPress={addGameQuestion}>
          <Text style={styles.btnText}>Add to Game</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.listSectionTitle}>Patient Performance</Text>
      {results.slice(0, 5).map((r, i) => (
        <Card key={i} style={styles.listItem}>
          <View>
            <Text style={styles.itemTitle}>Score: {r.score} / {r.total}</Text>
            <Text style={styles.subText}>Played: {new Date(r.playedAt).toLocaleString()}</Text>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderEldNotes = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Care Notes Instructions</Text>
        <Text style={styles.subText}>Send daily instructions or reminders to the patient.</Text>
        <Input placeholder="Note Title (e.g. Morning Medicine)" value={noteTitle} onChangeText={setNoteTitle} />
        <Input multiline placeholder="Type detailed instructions here..." value={noteText} onChangeText={setNoteText} />
        <TouchableOpacity style={styles.btnPrimary} onPress={addNote}>
          <Text style={styles.btnText}>Post to Care Notes</Text>
        </TouchableOpacity>
      </Card>
      <Text style={styles.listSectionTitle}>Instruction History</Text>
      {notes.map(n => (
        <Card key={n._id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{n.title}</Text>
            <Text style={styles.itemText}>{n.content}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteNote(n._id)} style={styles.delBtn}><Text style={styles.delText}>Delete</Text></TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderEldMemories = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Add Memory for Patient</Text>
        <Input placeholder="Memory Title" value={memoryForm.title} onChangeText={t => setMemoryForm({ ...memoryForm, title: t })} />
        <Input multiline placeholder="Describe the memory..." value={memoryForm.story} onChangeText={t => setMemoryForm({ ...memoryForm, story: t })} />
        <TouchableOpacity style={styles.btnPrimary} onPress={addMemory}><Text style={styles.btnText}>Save Memory</Text></TouchableOpacity>
      </Card>
      <Text style={styles.listSectionTitle}>Memory Lane</Text>
      {memories.map(m => (
        <Card key={m._id} style={styles.listItem}>
          <View style={{ flex: 1 }}><Text style={styles.itemTitle}>{m.title}</Text><Text style={styles.itemText}>{m.story}</Text></View>
          <TouchableOpacity onPress={() => deleteMemory(m._id)} style={styles.delBtn}><Text style={styles.delText}>Delete</Text></TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderContacts = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Add Emergency Contact</Text>
        <Input placeholder="Name" value={contactForm.name} onChangeText={t => setContactForm({ ...contactForm, name: t })} />
        <Input placeholder="Phone" keyboardType="phone-pad" value={contactForm.phone} onChangeText={t => setContactForm({ ...contactForm, phone: t })} />
        <Input placeholder="Relation" value={contactForm.relation} onChangeText={t => setContactForm({ ...contactForm, relation: t })} />
        <TouchableOpacity style={styles.btnPrimary} onPress={addContact}><Text style={styles.btnText}>Save Contact</Text></TouchableOpacity>
      </Card>
      <Text style={styles.listSectionTitle}>Contacts</Text>
      {contacts.map(c => (
        <Card key={c._id} style={styles.listItem}>
          <View style={{ flex: 1 }}><Text style={styles.itemTitle}>{c.name}</Text><Text style={styles.itemText}>{c.phone}</Text></View>
          <TouchableOpacity onPress={() => deleteContact(c._id)} style={styles.delBtn}><Text style={styles.delText}>Delete</Text></TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderEldTasks = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Shared Care Routines</Text>
        <Text style={styles.subText}>Add tasks that the patient should complete. Synced in real-time.</Text>
        <Input placeholder="Routine task (e.g. Evening walk)" value={eldTaskText} onChangeText={setEldTaskText} />
        <TouchableOpacity style={styles.btnPrimary} onPress={addEldTask}>
            <Text style={styles.btnText}>Add to Routine</Text>
        </TouchableOpacity>
      </Card>
      <Text style={styles.listSectionTitle}>Current Patient Routines</Text>
      {eldTasks.map(t => (
        <Card key={t._id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.itemDate}>Daily • {t.status === 'done' ? '✅ Completed' : '⏳ Pending'}</Text>
            </View>
            <Text style={[styles.itemText, t.status === 'done' && styles.textStrike]}>{t.text}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteEldTask(t._id)} style={styles.delBtn}>
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderContent = () => {
    if (isElderly) {
      switch (activeTab) {
        case "notes": return renderEldNotes();
        case "memories": return renderEldMemories();
        case "tasks": return renderEldTasks();
        case "contacts": return renderContacts();
        default: return null;
      }
    } else {
      switch (activeTab) {
        case "notes": return renderAlzNotes();
        case "tasks": return renderAlzRoutine();
        case "private": return renderAlzPrivate();
        case "game": return renderAlzGame();
        case "contacts": return renderContacts();
        default: return null;
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.backButton}>
          <Text style={styles.backButtonIcon}>← Home</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Caregiver Panel</Text>
          <Text style={styles.headerSub}>
            Patient: {user?.linkedPatientName || "Unknown"} ({user?.linkedPatientType === 'elderly' ? 'Elderly' : 'Alzheimer'})
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={{ paddingBottom: 60 }} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.refreshBtn} onPress={loadAll}>
            <Text style={styles.refreshBtnText}>🔄 Refresh Data</Text>
          </TouchableOpacity>
          
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            renderContent()
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { padding: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12 },
  backButtonIcon: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" },
  tabsWrap: { paddingHorizontal: 16, marginTop: 16 },
  tabs: { flexDirection: "row" },
  tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#fff", marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: "800" },
  tabTextActive: { color: "#fff" },
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: COLORS.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  formCard: { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" },
  formTitle: { fontSize: 18, fontWeight: "700", color: COLORS.primary, marginBottom: 8 },
  listSectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginTop: 10, marginBottom: 12 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16, color: COLORS.text },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  btnPrimary: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  listItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  itemDate: { color: COLORS.accent, fontSize: 12, fontWeight: "700", marginRight: 8 },
  itemText: { fontSize: 16, color: COLORS.text },
  subText: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  delBtn: { backgroundColor: "#FEE2E2", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#FECACA", marginLeft: 10 },
  delText: { color: COLORS.danger, fontWeight: "700", fontSize: 13 },
  emptyText: { color: COLORS.muted, fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  
  imagePreviewContainer: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 12, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '100%' },
  refreshBtn: { alignSelf: 'center', marginBottom: 15, paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#E2E8F0', borderRadius: 20 },
  refreshBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  imagePlaceholder: { width: '100%', height: 100, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.muted },
  mutedText: { color: COLORS.muted, fontSize: 14 },
  
  statusTag: { backgroundColor: COLORS.border, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  statusTagText: { fontSize: 9, fontWeight: "900", color: "#fff" },
  textStrike: { textDecorationLine: 'line-through', color: COLORS.muted },
  pickBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  pickBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 }
});
