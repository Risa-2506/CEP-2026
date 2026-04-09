require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

app.use(express.json());
const remedyRoutes = require("./routes/RemedyRoutes");
app.use("/remedies", remedyRoutes);
const doctorRoutes = require ("./routes/doctorRoutes");
app.use("/doctors", doctorRoutes);
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
