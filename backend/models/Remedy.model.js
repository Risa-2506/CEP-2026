const mongoose = require("mongoose");

const remedySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    remedies: {
        type: [String],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Remedy", remedySchema);