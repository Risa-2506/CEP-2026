const mongoose = require("mongoose");

const PLACE_CATEGORIES = [
    "laughter_club",
    "park",
    "temple",
    "community_center",
    "library",
    "yoga",
    "hospital",
    "pharmacy",
    "senior_center",
    "other"
];

const noteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        content: { type: String, required: true, trim: true, maxlength: 5000 }
    },
    { timestamps: true }
);

const contactSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        relation: { type: String, trim: true, maxlength: 80, default: "Family" },
        phone: { type: String, required: true, trim: true, maxlength: 30 },
        notes: { type: String, trim: true, maxlength: 600, default: "" }
    },
    { timestamps: true }
);

const memorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        story: { type: String, required: true, trim: true, maxlength: 10000 },
        memoryDate: { type: Date },
        mood: {
            type: String,
            enum: ["happy", "nostalgic", "grateful", "proud", "peaceful"],
            default: "happy"
        }
    },
    { timestamps: true }
);

const inspirationalSchema = new mongoose.Schema(
{
    title: { type: String, required: true, trim: true, maxlength: 200 },

    // 👇 ADD THESE
    teaser: { type: String, trim: true, maxlength: 300 },
    content: { type: String, trim: true, maxlength: 5000 },
    moral: { type: String, trim: true, maxlength: 500 },

    // 👇 keep old (optional)
    text: { type: String, trim: true }, 

    source: { type: String, trim: true, maxlength: 200, default: "" },

    category: {
        type: String,
        enum: ["story", "quote", "motivation"],
        default: "story"
    },

    isDaily: { type: Boolean, default: false },
    activeDate: { type: Date }
},
{ timestamps: true }
);

const placeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 200 },
        city: { type: String, trim: true, maxlength: 120, default: "" },
        category: { type: String, enum: PLACE_CATEGORIES, default: "other" },
        address: { type: String, required: true, trim: true, maxlength: 300 },
        phone: { type: String, trim: true, maxlength: 30, default: "" },
        timing: { type: String, trim: true, maxlength: 120, default: "" }
    },
    { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
    isPrivate: { type: Boolean, default: false } // Hidden from the patient
  },
  { timestamps: true }
);

const ElderlyNote = mongoose.model("ElderlyNote", noteSchema);
const ElderlyContact = mongoose.model("ElderlyContact", contactSchema);
const ElderlyMemory = mongoose.model("ElderlyMemory", memorySchema);
const ElderlyInspirational = mongoose.model("ElderlyInspirational", inspirationalSchema);
const ElderlyPlace = mongoose.model("ElderlyPlace", placeSchema);
const ElderlyTask = mongoose.model("ElderlyTask", taskSchema);

module.exports = {
    PLACE_CATEGORIES,
    ElderlyNote,
    ElderlyContact,
    ElderlyMemory,
    ElderlyInspirational,
    ElderlyPlace,
    ElderlyTask
};