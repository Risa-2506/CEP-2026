const express = require("express");
const router = express.Router();

// Import controller functions
const { fetchDoctors, fetchSingleDoctor, addDoctor } = require("../controllers/Doctor.controller");

// GET all doctors
router.get("/", fetchDoctors);

// GET a single doctor by ID
router.get("/:id", fetchSingleDoctor);

// POST a new doctor
router.post("/", addDoctor);

module.exports = router;