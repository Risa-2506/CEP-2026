const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected ");
    } catch (error) {
        console.error("DB connection error ", error);
        process.exit(1);
    }
};

module.exports = connectDB;