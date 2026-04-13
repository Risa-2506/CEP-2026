const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,

  // Tasks
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  createGameQuestion,
  getGameQuestions,
  createContact,
  getContacts,
  updateContact,
  deleteContact,
  submitGame,
  getGameResults,
} = require("../controllers/alzheimerController");

// NOTES ROUTES
router.post("/notes", authMiddleware, createNote);
router.get("/notes", authMiddleware, getNotes);
router.put("/notes/:id", authMiddleware, updateNote);
router.delete("/notes/:id", authMiddleware, deleteNote);


// ================= TASKS =================

// create task
router.post("/tasks", authMiddleware, createTask);

// get all tasks
router.get("/tasks", authMiddleware, getTasks);

// update full task (text / dueTime)
router.put("/tasks/:id", authMiddleware, updateTask);

// update only status
router.put("/tasks/:id/status", authMiddleware, updateTaskStatus);

// delete task
router.delete("/tasks/:id", authMiddleware, deleteTask);


router.post("/game", authMiddleware, createGameQuestion);
router.get("/game", authMiddleware, getGameQuestions);
router.post("/game/submit", authMiddleware, submitGame);
router.get("/game/results", authMiddleware, getGameResults);


// CONTACTS
router.post("/contacts", authMiddleware, createContact);
router.get("/contacts", authMiddleware, getContacts);
router.put("/contacts/:id", authMiddleware, updateContact);
router.delete("/contacts/:id", authMiddleware, deleteContact);


module.exports = router;