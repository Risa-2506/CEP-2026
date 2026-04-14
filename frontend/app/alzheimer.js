import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, SafeAreaView, Platform, StatusBar, TouchableOpacity, Image, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { alzheimerAPI } from "../services/api";

const TABS = [
  { key: "notes", label: "Care Notes" },
  { key: "tasks", label: "Routine" },
  { key: "game", label: "Memory" },
  { key: "contacts", label: "Contacts" }
];

const COLORS = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  primary: "#7C3AED",
  accent: "#8B5CF6",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  success: "#16A34A",
  warning: "#F59E0B"
};

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export default function AlzheimerPatient() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(params.tab || "notes");
  const [loading, setLoading] = useState(false);

  // States
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Game state
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameAnswers, setGameAnswers] = useState([]);
  const [gameScore, setGameScore] = useState(null);

  // New states for task management
  const [newTaskText, setNewTaskText] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const notesRes = await alzheimerAPI.notes.getAll();
      const tasksRes = await alzheimerAPI.tasks.getAll();
      const contactsRes = await alzheimerAPI.contacts.getAll();
      const gameRes = await alzheimerAPI.game.getAllQuestions();

      if (notesRes.success) setNotes(notesRes.notes || []);
      if (tasksRes.success) setTasks(tasksRes.tasks || []);
      if (contactsRes.success) setContacts(contactsRes.contacts || []);
      if (gameRes.success) setQuestions(gameRes.questions || []);
    } catch (error) {
      console.log("Error loading patient data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleNoteStatus = async (noteId, currentStatus) => {
    let newStatus = "pending";
    if (currentStatus === "pending") newStatus = "acknowledged";
    else if (currentStatus === "acknowledged") newStatus = "completed";
    else newStatus = "pending";

    try {
      await alzheimerAPI.notes.updateStatus(noteId, newStatus);
      await loadAll();
    } catch (e) {
      console.log("Failed to update note status", e);
    }
  };

  const handleTaskStatus = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    try {
      await alzheimerAPI.tasks.updateStatus(task._id, newStatus);
      await loadAll();
    } catch (e) {
      console.log("Failed to update status", e);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    setTaskLoading(true);
    try {
      const res = await alzheimerAPI.tasks.create({ text: newTaskText });
      if (res.success) {
        setNewTaskText("");
        await loadAll();
      }
    } catch (e) {
      Alert.alert("Error", "Failed to add task");
    } finally {
      setTaskLoading(false);
    }
  };

  const deleteTask = async (id) => {
    Alert.alert("Delete Task", "Are you sure you want to remove this task?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await alzheimerAPI.tasks.delete(id);
            await loadAll();
          } catch (e) {
            Alert.alert("Error", "Failed to delete task");
          }
        } 
      }
    ]);
  };

  const handleGameSelect = async (questionId, selectedAnswer) => {
    const newAnswers = [...gameAnswers, { questionId, selectedAnswer }];
    setGameAnswers(newAnswers);

    if (currentGameIndex + 1 < questions.length) {
      setCurrentGameIndex(currentGameIndex + 1);
    } else {
      try {
        const res = await alzheimerAPI.game.submitAnswers(newAnswers);
        if (res.success) {
          setGameScore({ score: res.score, total: res.total });
        }
      } catch (err) {
        console.log("Submit game error", err);
      }
    }
  };

  const resetGame = () => {
    setCurrentGameIndex(0);
    setGameAnswers([]);
    setGameScore(null);
  };

  const renderNotes = () => (
    <View>
      <Text style={styles.sectionTitle}>Caregiver Instructions</Text>
      {notes.length === 0 && <Text style={styles.emptyText}>No instructions from your caregiver yet.</Text>}
      {notes.map(n => (
        <Card key={n._id} style={[styles.noteCard, n.status === "completed" && styles.noteCardDone]}>
          <Text style={[styles.noteText, n.status === "completed" && styles.textStrike]}>{n.text}</Text>
          <View style={styles.noteFooter}>
            <Text style={styles.noteDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
            <TouchableOpacity 
              onPress={() => handleNoteStatus(n._id, n.status)}
              style={[
                styles.statusBadge, 
                n.status === "acknowledged" && { backgroundColor: COLORS.warning },
                n.status === "completed" && { backgroundColor: COLORS.success }
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {n.status === "pending" ? "Click to Acknowledge" : n.status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderTasks = () => (
    <View>
      <Text style={styles.sectionTitle}>My Daily Routine</Text>
      
      <Card style={styles.addCard}>
        <TextInput
          style={styles.taskInput}
          placeholder="New individual task..."
          value={newTaskText}
          onChangeText={setNewTaskText}
          placeholderTextColor={COLORS.muted}
        />
        <TouchableOpacity 
          style={[styles.addButton, !newTaskText.trim() && { opacity: 0.5 }]} 
          onPress={addTask}
          disabled={!newTaskText.trim() || taskLoading}
        >
          {taskLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>+</Text>
          )}
        </TouchableOpacity>
      </Card>

      {tasks.length ? tasks.map(t => (
        <View key={t._id} style={styles.taskContainer}>
          <TouchableOpacity onPress={() => handleTaskStatus(t)} style={{ flex: 1 }}>
            <Card style={[styles.taskCard, t.status === "done" && styles.taskCardDone]}>
              <View style={styles.taskRow}>
                <View style={[styles.checkbox, t.status === "done" && styles.checkboxDone]}>
                  {t.status === "done" && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.taskText, t.status === "done" && styles.taskTextDone]}>{t.text}</Text>
              </View>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(t._id)} style={styles.taskDeleteBtn}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )) : <Text style={styles.emptyText}>No routine tasks today!</Text>}
    </View>
  );

  const renderGame = () => {
    if (questions.length === 0) return <Text style={styles.emptyText}>No games available today.</Text>;
    
    if (gameScore !== null) {
      return (
        <View style={styles.scoreContainer}>
          <Text style={{ fontSize: 60, textAlign: 'center' }}>🎉</Text>
          <Text style={styles.scoreTitle}>Game Finished!</Text>
          <Text style={styles.scoreText}>You scored {gameScore.score} out of {gameScore.total}</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={resetGame}>
            <Text style={styles.btnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentQuestion = questions[currentGameIndex];
    return (
      <View>
        <Text style={styles.sectionTitle}>Memory Challenge</Text>
        <Card style={styles.gameCard}>
          <Text style={styles.gameQuestion}>{currentQuestion.question}</Text>
          
          {currentQuestion.image ? (
            <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: currentQuestion.image }} 
                  style={styles.gameImage} 
                  resizeMode="cover"
                  onLoadStart={() => console.log("Alzheimer Game Image: Loading started")}
                  onLoadEnd={() => console.log("Alzheimer Game Image: Loading finished")}
                  onError={(e) => {
                    console.log("Alzheimer Game Image Load Error:", e.nativeEvent.error);
                    Alert.alert("Image Load Error", "Could not load image. It might be due to an invalid URL or unsupported format.");
                  }}
                />
            </View>
          ) : (
            <View style={[styles.gameImage, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed' }]}>
                <Text style={{ color: '#94A3B8' }}>No Image Provided</Text>
            </View>
          )}

          <View style={styles.optionsWrap}>
            {currentQuestion.options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionBtn}
                onPress={() => handleGameSelect(currentQuestion._id, opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.emptyText, { marginTop: 20 }]}>Question {currentGameIndex + 1} of {questions.length}</Text>
        </Card>
      </View>
    );
  };

  const renderContacts = () => (
    <View>
      <Text style={styles.sectionTitle}>My Helpful People</Text>
      {contacts.length ? contacts.map(c => (
        <Card key={c._id}>
          <View style={styles.taskRow}>
            <View style={styles.contactIcon}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{c.name}</Text>
              <Text style={styles.contactRelation}>{c.relation}</Text>
              <Text style={styles.contactPhone}>{c.phone}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )) : <Text style={styles.emptyText}>No contacts added yet.</Text>}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "notes": return renderNotes();
      case "game": return renderGame();
      case "tasks": return renderTasks();
      case "contacts": return renderContacts();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.backButton}>
          <Text style={styles.backButtonIcon}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alzheimer Care</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {TABS.map((tab) => (
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

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          renderContent()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { padding: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12 },
  backButtonIcon: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  tabsWrap: { paddingHorizontal: 16, marginTop: 16 },
  tabs: { flexDirection: "row" },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: "#fff", marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontSize: 16, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: COLORS.text, marginBottom: 16 },
  card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { fontSize: 18, color: COLORS.muted, textAlign: "center", marginTop: 40 },
  
  // Note specific
  noteCard: { borderLeftWidth: 6, borderLeftColor: COLORS.primary },
  noteCardDone: { borderLeftColor: COLORS.success, backgroundColor: "#F0FDF4" },
  noteText: { fontSize: 18, fontWeight: "600", color: COLORS.text, marginBottom: 12 },
  noteFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  noteDate: { fontSize: 12, color: COLORS.muted },
  statusBadge: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  statusBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  textStrike: { textDecorationLine: "line-through", color: COLORS.muted },

  // Tasks
  taskCard: { padding: 16 },
  taskCardDone: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  taskRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginRight: 15 },
  checkboxDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkMark: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  taskText: { fontSize: 20, fontWeight: "600", color: COLORS.text, flex: 1 },
  taskTextDone: { textDecorationLine: "line-through", color: COLORS.muted },
  
  // Contacts
  contactIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginRight: 15 },
  contactName: { fontSize: 18, fontWeight: "700" },
  contactPhone: { fontSize: 16, color: COLORS.primary, marginVertical: 4 },
  contactRelation: { fontSize: 14, color: COLORS.muted },
  callBtn: { marginLeft: "auto", backgroundColor: COLORS.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  callText: { color: "#fff", fontWeight: "bold" },
  
  // Game
  gameCard: { padding: 18, alignItems: "center" },
  gameQuestion: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 20, color: COLORS.text, lineHeight: 30 },
  imageContainer: { width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', marginBottom: 20, backgroundColor: '#EDF2F7', elevation: 3 },
  gameImage: { width: '100%', height: '100%' },
  optionsWrap: { width: "100%", gap: 12 },
  optionBtn: { width: "100%", padding: 16, borderRadius: 12, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#CBD5E1", alignItems: "center" },
  optionText: { fontSize: 18, fontWeight: "600", color: "#334155" },
  scoreContainer: { alignItems: "center", marginTop: 40, padding: 20 },
  scoreTitle: { fontSize: 28, fontWeight: "800", color: COLORS.text, marginTop: 16 },
  scoreText: { fontSize: 20, color: COLORS.muted, marginVertical: 16 },
  btnPrimary: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16, marginTop: 20 },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  // Task specific
  addCard: { flexDirection: 'row', padding: 10, alignItems: 'center', backgroundColor: '#fff', marginBottom: 20 },
  taskInput: { flex: 1, height: 50, fontSize: 18, paddingHorizontal: 15, color: COLORS.text },
  addButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  addButtonText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  taskContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  taskDeleteBtn: { padding: 15, justifyContent: 'center' },
  deleteIcon: { fontSize: 20 }
});
