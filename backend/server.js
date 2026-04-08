require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

app.use(express.json());
const remedyRoutes = require("./routes/RemedyRoutes");
const alzheimerRoutes = require("./routes/alzheimer");
app.use("/remedies", remedyRoutes);
app.use("/alzheimer", alzheimerRoutes);
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
