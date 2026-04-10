require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

app.use(cors());
app.use(express.json());
const remedyRoutes = require("./routes/RemedyRoutes");
const elderlyRoutes = require("./routes/ElderlyRoutes");
app.use("/remedies", remedyRoutes);
const doctorRoutes = require ("./routes/doctorRoutes");
app.use("/doctors", doctorRoutes);
app.use("/elderly", elderlyRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
