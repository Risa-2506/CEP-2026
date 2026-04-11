const {
    PLACE_CATEGORIES,
    ElderlyNote,
    ElderlyContact,
    ElderlyMemory,
    ElderlyInspirational,
    ElderlyPlace
} = require("../models/Elderly.model");

const ok = (res, data, message = "Success", status = 200) =>
    res.status(status).json({ success: true, message, data });

const fail = (res, message = "Server error", status = 500) =>
    res.status(status).json({ success: false, message });

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getNotes = async (req, res) => {
    try {
        const notes = await ElderlyNote.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return ok(res, notes);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title?.trim() || !content?.trim()) {
            return fail(res, "Title and content are required.", 400);
        }
        const note = await ElderlyNote.create({ userId: req.user._id, title, content });
        return ok(res, note, "Note created", 201);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await ElderlyNote.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, content },
            { new: true, runValidators: true }
        );
        if (!note) {
            return fail(res, "Note not found.", 404);
        }
        return ok(res, note, "Note updated");
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await ElderlyNote.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!note) {
            return fail(res, "Note not found.", 404);
        }
        return ok(res, null, "Note deleted");
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.getContacts = async (req, res) => {
    try {
        const contacts = await ElderlyContact.find({ userId: req.user._id }).sort({ name: 1 });
        return ok(res, contacts);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.createContact = async (req, res) => {
    try {
        const { name, relation, phone, notes } = req.body;
        if (!name?.trim() || !phone?.trim()) {
            return fail(res, "Name and phone are required.", 400);
        }
        const contact = await ElderlyContact.create({ userId: req.user._id, name, relation, phone, notes });
        return ok(res, contact, "Contact added", 201);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.updateContact = async (req, res) => {
    try {
        const contact = await ElderlyContact.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!contact) {
            return fail(res, "Contact not found.", 404);
        }
        return ok(res, contact, "Contact updated");
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const contact = await ElderlyContact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!contact) {
            return fail(res, "Contact not found.", 404);
        }
        return ok(res, null, "Contact deleted");
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.getMemories = async (req, res) => {
    try {
        const memories = await ElderlyMemory.find({ userId: req.user._id }).sort({ memoryDate: -1, createdAt: -1 });
        return ok(res, memories);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.createMemory = async (req, res) => {
    try {
        const { title, story } = req.body;
        if (!title?.trim() || !story?.trim()) {
            return fail(res, "Title and story are required.", 400);
        }
        const memory = await ElderlyMemory.create({ ...req.body, userId: req.user._id });
        return ok(res, memory, "Memory saved", 201);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.updateMemory = async (req, res) => {
    try {
        const memory = await ElderlyMemory.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!memory) {
            return fail(res, "Memory not found.", 404);
        }
        return ok(res, memory, "Memory updated");
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.deleteMemory = async (req, res) => {
    try {
        const memory = await ElderlyMemory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!memory) {
            return fail(res, "Memory not found.", 404);
        }
        return ok(res, null, "Memory deleted");
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.getDailyInspirational = async (_req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        let daily = await ElderlyInspirational.findOne({
            isDaily: true,
            activeDate: { $gte: today, $lt: tomorrow }
        }).sort({ createdAt: -1 });

        if (!daily) {
            daily = await ElderlyInspirational.findOne({}).sort({ createdAt: -1 });
        }

        return ok(res, daily || null);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.getInspirationals = async (_req, res) => {
    try {
        const inspirationals = await ElderlyInspirational.find({}).sort({ createdAt: -1 });
        return ok(res, inspirationals);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.saveInspirational = async (req, res) => {
    try {
        const { title, text } = req.body;
        if (!title?.trim() || !text?.trim()) {
            return fail(res, "Title and text are required.", 400);
        }
        const inspirational = await ElderlyInspirational.create(req.body);
        return ok(res, inspirational, "Inspirational saved", 201);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.deleteInspirational = async (req, res) => {
    try {
        const inspirational = await ElderlyInspirational.findByIdAndDelete(req.params.id);
        if (!inspirational) {
            return fail(res, "Inspirational not found.", 404);
        }
        return ok(res, null, "Inspirational deleted");
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.getCategories = async (_req, res) => {
    const labels = {
        laughter_club: "Laughter Club",
        park: "Park / Garden",
        temple: "Temple / Place of Worship",
        community_center: "Community Centre",
        library: "Library",
        yoga: "Yoga / Exercise",
        hospital: "Hospital",
        pharmacy: "Pharmacy",
        senior_center: "Senior Citizen Centre",
        other: "Other"
    };

    return ok(
        res,
        PLACE_CATEGORIES.map((key) => ({ key, label: labels[key] || key }))
    );
};

exports.getNearbyPlaces = async (req, res) => {
    try {
        const category = req.query.category || req.body?.category;
        const city = (req.query.city || req.body?.city || "").trim();

        let query = {};

        // filter by category
        if (category && category !== "all") {
            query.category = category;
        }

        // filter by city: exact match on city field (case-insensitive)
        if (city) {
            query.city = { $regex: city, $options: "i" };
        }

        const places = await ElderlyPlace.find(query).sort({ createdAt: -1 });

        return ok(res, places);
    } catch (error) {
        return fail(res, error.message);
    }
};

exports.addPlace = async (req, res) => {
    try {
        const { name, city, address } = req.body;
        if (!name?.trim() || !address?.trim()) {
            return fail(res, "Name and address are required.", 400);
        }
        const place = await ElderlyPlace.create(req.body);
        return ok(res, place, "Place added", 201);
    } catch (error) {
        return fail(res, error.message);
    }
};

// GET STORIES (Swipe cards)
exports.getStories = async (req, res) => {
  try {
    const stories = await ElderlyInspirational.find({ category: "story" })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ data: stories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stories" });
  }
};