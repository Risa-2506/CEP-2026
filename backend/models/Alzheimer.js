const mongoose = require("mongoose");

const alzheimerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  caregiver: {
    type: String,
  },
  guardian: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Alzheimer", alzheimerSchema);