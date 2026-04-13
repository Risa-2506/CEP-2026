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
const remedyRoutes = require("./routes/RemedyRoutes");    //done
const alzheimerRoutes = require("./routes/alzheimer");    //done
const alzheimerFeatures = require("./routes/AlzheimerRoutes");
const authRoutes = require("./routes/auth");

app.use("/remedies", remedyRoutes);   //done
app.use("/alzheimer", alzheimerRoutes);  //done
app.use("/alzheimer", alzheimerFeatures);  //done
app.use("/auth", authRoutes);

// Elderly Routes
const elderlyProfileRoutes = require("./routes/elderly");  //done
const elderlyFeatureRoutes = require("./routes/ElderlyRoutes");  //done

// Both routers handle endpoints under /elderly
app.use("/elderly", elderlyProfileRoutes);   //done
app.use("/elderly", elderlyFeatureRoutes);   //done

const doctorRoutes = require ("./routes/doctorRoutes");    //done
app.use("/doctors", doctorRoutes);   //done
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
