const express = require("express");
const router = express.Router();
const Alzheimer = require("../models/Alzheimer");

// SAVE DATA
router.post("/", async (req, res) => {
  try {
    const newData = await Alzheimer.create(req.body);
    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;