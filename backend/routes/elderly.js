const express = require("express");
const router = express.Router();
const Elderly = require("../models/Elderly");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// CHECK if logged-in user has a patient profile
router.get("/check", authMiddleware, async (req, res) => {
  try {
    const profile = await Elderly.findOne({ userId: req.user._id });
    res.json({ hasProfile: !!profile, profile: profile || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET logged-in user's patient profile
router.get("/my-profile", authMiddleware, async (req, res) => {
  try {
    const profile = await Elderly.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "No elderly profile found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new patient profile (protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { patientName, age, caregiver, guardians, emergencyContacts } = req.body;

    // Check if user already has a profile
    const existing = await Elderly.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Elderly profile already exists" });
    }

    const newData = await Elderly.create({
      userId: req.user._id,
      patientName,
      age,
      caregiver: caregiver || {},
      guardians: guardians || [],
      emergencyContacts: emergencyContacts || [],
    });

    // Update user role to patient
    await User.findByIdAndUpdate(req.user._id, { role: "patient" });

    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
