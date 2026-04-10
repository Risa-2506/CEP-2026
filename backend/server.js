require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const remedyRoutes = require("./routes/RemedyRoutes");
const alzheimerRoutes = require("./routes/alzheimer");
const authRoutes = require("./routes/auth");

app.use("/remedies", remedyRoutes);
app.use("/alzheimer", alzheimerRoutes);
app.use("/auth", authRoutes);

// Elderly Routes
const elderlyProfileRoutes = require("./routes/elderly");
const elderlyFeatureRoutes = require("./routes/ElderlyRoutes");

// Both routers handle endpoints under /elderly
app.use("/elderly", elderlyProfileRoutes);
app.use("/elderly", elderlyFeatureRoutes);

const doctorRoutes = require ("./routes/doctorRoutes");
app.use("/doctors", doctorRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
