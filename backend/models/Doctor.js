const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  location: { type: String },
  contact: { type: String },
  email: { type: String }
});

module.exports = mongoose.model('Doctor', doctorSchema);