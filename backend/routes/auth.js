const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Alzheimer = require("../models/Alzheimer");
const Elderly = require("../models/Elderly");
const authMiddleware = require("../middleware/authMiddleware");

// Helper to discover if a user is a patient, caregiver, or guardian
const discoverUserRole = async (user) => {
  const userEmail = (user.email || "").toLowerCase().trim();
  console.log(`[AUTH] Discovering role for: ${userEmail} (ID: ${user._id})`);
  
  let role = "user";
  let id = null;
  let name = "";
  let type = "";

  // 1. Check Patients (Highest priority for 'role' assignment)
  const alzPatient = await Alzheimer.findOne({ userId: user._id });
  const eldPatient = await Elderly.findOne({ userId: user._id });

  if (alzPatient) {
    role = "patient";
    id = alzPatient._id;
    name = alzPatient.patientName;
    type = "alzheimer";
    console.log(`[AUTH] Found as Alzheimer Patient: ${id}`);
  } else if (eldPatient) {
    role = "patient";
    id = eldPatient._id;
    name = eldPatient.patientName;
    type = "elderly";
    console.log(`[AUTH] Found as Elderly Patient: ${id}`);
  } else {
    // 2. Check Caregivers
    // Use regex to be safe with casing and whitespace
    const emailRegex = new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    
    const alzCaregiver = await Alzheimer.findOne({ "caregiver.email": emailRegex });
    const eldCaregiver = await Elderly.findOne({ "caregiver.email": emailRegex });

    if (alzCaregiver) {
      role = "caregiver";
      id = alzCaregiver._id;
      name = alzCaregiver.patientName;
      type = "alzheimer";
      console.log(`[AUTH] Found as Alzheimer Caregiver for: ${name} (${id})`);
    } else if (eldCaregiver) {
      role = "caregiver";
      id = eldCaregiver._id;
      name = eldCaregiver.patientName;
      type = "elderly";
      console.log(`[AUTH] Found as Elderly Caregiver for: ${name} (${id})`);
    } else {
      // 3. Check Guardians
      const alzGuardian = await Alzheimer.findOne({ "guardians.email": emailRegex });
      const eldGuardian = await Elderly.findOne({ "guardians.email": emailRegex });

      if (alzGuardian) {
        role = "guardian";
        id = alzGuardian._id;
        name = alzGuardian.patientName;
        type = "alzheimer";
        console.log(`[AUTH] Found as Alzheimer Guardian for: ${name} (${id})`);
      } else if (eldGuardian) {
        role = "guardian";
        id = eldGuardian._id;
        name = eldGuardian.patientName;
        type = "elderly";
        console.log(`[AUTH] Found as Elderly Guardian for: ${name} (${id})`);
      }
    }
  }

  return { role, id, name, type };
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name: name || "",
      email: normalizedEmail,
      password,
    });

    // Check if this new user is already a caregiver or guardian
    const linkInfo = await discoverUserRole(user);
    if (linkInfo.role !== "user") {
      user.role = linkInfo.role;
      user.linkedPatientId = linkInfo.id;
      user.linkedPatientName = linkInfo.name;
      user.linkedPatientType = linkInfo.type;
      await user.save();
    }

    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedPatientId: user.linkedPatientId,
      linkedPatientName: user.linkedPatientName,
      linkedPatientType: user.linkedPatientType,
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error during signup" });
  }
});

// ALZHEIMER SPECIFIC SIGNUP (Guest flow)
router.post("/alzheimer-signup", async (req, res) => {
  try {
    const { name, email, password, patientName, age, caregiver, guardians } = req.body;

    if (!email || !password || !patientName) {
      return res.status(400).json({ message: "Email, password, and patient name are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return res.status(400).json({ message: "User already exists. Please login instead." });
    }

    // 1. Create User
    user = await User.create({
      name: name || patientName,
      email: normalizedEmail,
      password,
      role: "patient",
      linkedPatientName: patientName,
      linkedPatientType: "alzheimer",
    });

    // 2. Create Alzheimer Profile
    const alzProfile = await Alzheimer.create({
      userId: user._id,
      patientName,
      age,
      caregiver: caregiver || {},
      guardians: guardians || [],
    });

    user.linkedPatientId = alzProfile._id;
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedPatientId: user.linkedPatientId,
      linkedPatientName: user.linkedPatientName,
      linkedPatientType: user.linkedPatientType,
      token,
    });
  } catch (err) {
    console.error("Alzheimer Signup error:", err);
    res.status(500).json({ message: "Failed to create Alzheimer profile" });
  }
});

// ELDERLY SPECIFIC SIGNUP (Guest flow)
router.post("/elderly-signup", async (req, res) => {
  try {
    const { name, email, password, patientName, age, caregiver, guardians } = req.body;

    if (!email || !password || !patientName) {
      return res.status(400).json({ message: "Email, password, and patient name are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return res.status(400).json({ message: "User already exists. Please login instead." });
    }

    // 1. Create User
    user = await User.create({
      name: name || patientName,
      email: normalizedEmail,
      password,
      role: "patient",
      linkedPatientName: patientName,
      linkedPatientType: "elderly",
    });

    // 2. Create Elderly Profile
    const eldProfile = await Elderly.create({
      userId: user._id,
      patientName,
      age,
      caregiver: caregiver || {},
      guardians: guardians || [],
    });

    user.linkedPatientId = eldProfile._id;
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedPatientId: user.linkedPatientId,
      linkedPatientName: user.linkedPatientName,
      linkedPatientType: user.linkedPatientType,
      token,
    });
  } catch (err) {
    console.error("Elderly Signup error:", err);
    res.status(500).json({ message: "Failed to create Elderly profile" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Role discovery
    const linkInfo = await discoverUserRole(user);
    user.role = linkInfo.role;
    user.linkedPatientId = linkInfo.id;
    user.linkedPatientName = linkInfo.name;
    user.linkedPatientType = linkInfo.type;
    await user.save();

    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedPatientId: user.linkedPatientId,
      linkedPatientName: user.linkedPatientName,
      linkedPatientType: user.linkedPatientType,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// GET CURRENT USER (from token)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Refresh role links
    const linkInfo = await discoverUserRole(user);
    user.role = linkInfo.role;
    user.linkedPatientId = linkInfo.id;
    user.linkedPatientName = linkInfo.name;
    user.linkedPatientType = linkInfo.type;
    
    await User.findByIdAndUpdate(user._id, { 
      role: user.role, 
      linkedPatientId: user.linkedPatientId,
      linkedPatientName: user.linkedPatientName,
      linkedPatientType: user.linkedPatientType
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedPatientId: user.linkedPatientId,
      linkedPatientName: user.linkedPatientName,
      linkedPatientType: user.linkedPatientType,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/role-check - Manually trigger a role discovery check
router.get("/role-check", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const linkInfo = await discoverUserRole(user);
    
    // Update user in DB with discovered info
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      role: linkInfo.role,
      linkedPatientId: linkInfo.id,
      linkedPatientName: linkInfo.name,
      linkedPatientType: linkInfo.type
    }, { new: true }).select("-password");

    res.json({
      success: true,
      role: updatedUser.role,
      linkedPatientId: updatedUser.linkedPatientId,
      linkedPatientName: updatedUser.linkedPatientName,
      linkedPatientType: updatedUser.linkedPatientType,
      user: updatedUser
    });
  } catch (err) {
    console.error("Role check error:", err);
    res.status(500).json({ message: "Failed to perform role check" });
  }
});

// POST /auth/sync-role - Explicitly re-sync role
router.post("/sync-role", authMiddleware, async (req, res) => {
  try {
    const linkInfo = await discoverUserRole(req.user);
    
    const user = await User.findByIdAndUpdate(req.user._id, {
      role: linkInfo.role,
      linkedPatientId: linkInfo.id,
      linkedPatientName: linkInfo.name,
      linkedPatientType: linkInfo.type
    }, { new: true }).select("-password");

    res.json({
      success: true,
      message: "Role profile synchronized successfully",
      role: user.role,
      linkedPatientType: user.linkedPatientType,
      linkedPatientName: user.linkedPatientName
    });
  } catch (err) {
    console.error("Sync role error:", err);
    res.status(500).json({ message: "Sync failed" });
  }
});

module.exports = router;