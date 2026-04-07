const mongoose = require("mongoose");

const Remedy = require("../models/Remedy.model");
async function fetchRemedy(req, res, next) {
    try {
        const data = await Remedy.find({});

        if (data.length === 0) {
            return res.json({ message: "No remedies found" });
        }

        const formattedData = data.map(item => ({
            id: item._id,
            name: item.name,
            remedyCount: item.remedies.length
        }));

        res.json(formattedData);

    } catch (err) {
        res.status(500).json({
            message: "Server error while fetching remedy"
        })
    }
}

async function fetchSingleRemedy(req, res, next) {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid remedy ID format"
            });
        }

        const data = await Remedy.findById(id);
        if (!data) {
            return res.status(404).json({
                message: "Remedy not found"
            });
        }

        res.status(200).json({
            id: data._id,
            name: data.name,
            remedies: data.remedies
        });

    } catch (err) {
        res.status(500).json({
            message: "Server error while fetching remedy"
        });
    }
}
async function searchRemedies(req, res, next) {
    try {
        const search = req.query.search;
        let data;

        if (search) {
            data = await Remedy.find({
                name: { $regex: `^${search}`, $options: "i" }
            });
        }
        else {
            data = await Remedy.find({});
        }

        if (data.length === 0) {
            return res.status(404).json({
                message: "No remedies found"
            });
        }
        const formattedData = data.map(item => ({
            id: item._id,
            name: item.name,
            remedyCount: item.remedies.length
        }));

        res.status(200).json(formattedData);

    } catch (err) {
        res.status(500).json({
            message: "Server error while searching remedies"
        });
    }
}

module.exports = { fetchRemedy, fetchSingleRemedy, searchRemedies };