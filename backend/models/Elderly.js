const mongoose = require("mongoose");

const elderlySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  caregiver: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
  },
  guardians: [{
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
  }],
  emergencyContacts: [{
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    relationship: { type: String, default: "" },
  }],
}, { timestamps: true });

module.exports = mongoose.model("Elderly", elderlySchema);
