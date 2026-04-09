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
const elderlyRoutes = require("./routes/elderly");

app.use("/remedies", remedyRoutes);
app.use("/alzheimer", alzheimerRoutes);
app.use("/elderly", elderlyRoutes);
app.use("/auth", authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
