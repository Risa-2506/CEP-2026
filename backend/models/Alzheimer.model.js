const mongoose = require("mongoose");

//NoteSchema
const noteSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alzheimer",   // since you're focusing only on Alzheimer now
    required: true,
  },

  text: {
    type: String,
    required: true,
    trim: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdByRole: {
    type: String,
    enum: ["caregiver", "patient"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["pending", "acknowledged", "completed"],
    default: "pending",
  },
});

//Taskschema
const taskSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alzheimer",
    required: true,
  },

  text: {
    type: String,
    required: true,
    trim: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdByRole: {
    type: String,
    enum: ["caregiver", "patient"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending",
  },

  dueTime: {
    type: Date, // optional reminder time
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  isPrivate: {
    type: Boolean,
    default: false,
  },
});

//memory game schema
const memoryGameSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alzheimer",
    required: true,
  },

  question: {
    type: String,
    required: true,
  },

  image: {
    type: String, // image URL
  },

  options: [
    {
      type: String,
      required: true,
    }
  ],

  correctAnswer: {
    type: String,
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const gameResultSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alzheimer",
    required: true,
  },

  score: {
    type: Number,
    required: true,
  },

  total: {
    type: Number,
    required: true,
  },

  playedAt: {
    type: Date,
    default: Date.now,
  },
});

const contactSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alzheimer",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  relation: {
    type: String, // e.g., daughter, doctor
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const geofenceSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alzheimer",
    required: true,
  },
  centerLat: Number,
  centerLng: Number,
  radius: Number,
});

const alertSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alzheimer",
    required: true,
  },

  type: {
    type: String,
    enum: ["geofence", "fall", "emergency"],
    default: "geofence",
  },

  lat: {
    type: Number,
    required: true,
  },

  lng: {
    type: Number,
    required: true,
  },

  address: {
    type: String,
  },

  acknowledged: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Alert = mongoose.model("Alert", alertSchema);

const Geofence = mongoose.model("Geofence", geofenceSchema);

const AlzContact = mongoose.model("Contact", contactSchema);

const GameResult = mongoose.model("GameResult", gameResultSchema);

const AlzTask= mongoose.model("Alztask", taskSchema);
const AlzNote = mongoose.model("Alznote", noteSchema);
const AlzMemoryGame = mongoose.model("AlzmemoryGame", memoryGameSchema);

module.exports = { AlzTask, AlzNote, AlzMemoryGame, GameResult, AlzContact, Geofence, Alert };