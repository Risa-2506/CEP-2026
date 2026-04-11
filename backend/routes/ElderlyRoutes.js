// ============================================================
// backend/routes/ElderlyRoutes.js
// All routes for the elderly module — mirrors RemedyRoutes.js style
// ============================================================

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/Elderly.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all elderly feature routes
router.use(authMiddleware);

// ─── 1. Notepad ──────────────────────────────────────────────
// GET    /api/elderly/notepad        → get all notes
// POST   /api/elderly/notepad        → create note
// PUT    /api/elderly/notepad/:id    → update note
// DELETE /api/elderly/notepad/:id    → delete note
router.get("/notepad", ctrl.getNotes);
router.post("/notepad", ctrl.createNote);
router.put("/notepad/:id", ctrl.updateNote);
router.delete("/notepad/:id", ctrl.deleteNote);

// ─── 2. Contact Diary ────────────────────────────────────────
// GET    /api/elderly/contacts
// POST   /api/elderly/contacts
// PUT    /api/elderly/contacts/:id
// DELETE /api/elderly/contacts/:id
router.get("/contacts", ctrl.getContacts);
router.post("/contacts", ctrl.createContact);
router.put("/contacts/:id", ctrl.updateContact);
router.delete("/contacts/:id", ctrl.deleteContact);

// ─── 3. Memory Lane ──────────────────────────────────────────
// GET    /api/elderly/memories
// POST   /api/elderly/memories
// PUT    /api/elderly/memories/:id
// DELETE /api/elderly/memories/:id
router.get("/memories", ctrl.getMemories);
router.post("/memories", ctrl.createMemory);
router.put("/memories/:id", ctrl.updateMemory);
router.delete("/memories/:id", ctrl.deleteMemory);

// ─── 4. Inspirational ────────────────────────────────────────
// GET  /api/elderly/inspirational/today  → today's curated quote (public)
// GET  /api/elderly/inspirational        → user's saved inspirationals
// POST /api/elderly/inspirational        → save an inspirational
// DELETE /api/elderly/inspirational/:id
router.get("/inspirational/today", ctrl.getDailyInspirational);
router.get("/inspirational", ctrl.getInspirationals);
router.post("/inspirational", ctrl.saveInspirational);
router.delete("/inspirational/:id", ctrl.deleteInspirational);

// ─── 5. Places ───────────────────────────────────────────────
// GET  /api/elderly/places/categories  → list all categories (public)
// POST /api/elderly/places/nearby      → geo query (public)
// POST /api/elderly/places             → admin adds a place
router.get("/places/categories", ctrl.getCategories);
router.get("/places", ctrl.getNearbyPlaces);
router.post("/places/nearby", ctrl.getNearbyPlaces);
router.post("/places", ctrl.addPlace);

// ─── 6. Stories (for swipe cards) ───────────────────────────
// GET /api/elderly/stories → get motivational stories
router.get("/stories", ctrl.getStories);

module.exports = router;