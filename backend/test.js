const mongoose = require("mongoose");
const Elderly = require("./models/Elderly");
require("dotenv").config({ path: "./.env" });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const newData = await Elderly.create({
      userId: new mongoose.Types.ObjectId(),
      patientName: "Test Patient",
      age: null,
      caregiver: {
        name: "Test Care",
        phone: "123",
        email: "   ",
      },
      guardians: [],
      emergencyContacts: []
    });
    console.log("Success:", newData);
  } catch (error) {
    console.error("Error creating:", error.message);
  }
  mongoose.disconnect();
}
run();
