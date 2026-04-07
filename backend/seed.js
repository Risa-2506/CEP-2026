require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");


const Remedy = require("./models/Remedy.model");

const data = [
    {
        name: "Common Cold",
        remedies: [
            "Warm turmeric milk",
            "Steam inhalation",
            "Ginger tea",
            "Salt water gargle",
            "Rest well"
        ]
    },
    {
        name: "Fever",
        remedies: [
            "Drink fluids",
            "Take rest",
            "Cold compress",
            "Tulsi tea",
            "Light food"
        ]
    },
    {
        name: "Headache",
        remedies: [
            "Drink water",
            "Peppermint oil",
            "Rest in dark room",
            "Ginger tea",
            "Massage temples"
        ]
    },
    {
        name: "Sore throat ",
        remedies: [
            "Gargle with warm saltwater 3–4 times daily",
            "Consume honey mixed with warm water or tea",
            "Liquorice (mulethi) root tea soothes the throat",
            "Avoid cold drinks and ice cream",
            "Clove and ginger decoction with honey"


        ]

    },
    {
        name: "Acidity",
        remedies: [
            "Drink cold milk",
            "Avoid spicy food",
            "Eat smaller meals",
            "Drink coconut water",
            "Avoid lying down immediately after eating"
        ]
    },
    {
        name: "Stomach Pain",
        remedies: [
            "Drink warm water",
            "Use heating pad",
            "Drink ginger tea",
            "Avoid heavy meals",
            "Rest properly"
        ]
    },
    {
        name: "Back Pain",
        remedies: [
            "Apply hot or cold pack",
            "Do light stretching",
            "Maintain proper posture",
            "Rest adequately",
            "Massage affected area"
        ]
    },
    {
        name: "Indigestion",
        remedies: [
            "Drink warm water",
            "Consume ginger tea",
            "Avoid oily and spicy food",
            "Eat smaller meals",
            "Walk after meals"
        ]
    },
    {
        name: "Muscle Pain",
        remedies: [
            "Apply ice or heat pack",
            "Do gentle stretching",
            "Take proper rest",
            "Massage the affected area",
            "Stay hydrated"
        ]
    },
    {
        name: "Insomnia",
        remedies: [
            "Maintain a sleep schedule",
            "Avoid screens before bed",
            "Drink warm milk",
            "Practice relaxation techniques",
            "Keep room dark and quiet"
        ]
    }

];


const seedData = async () => {
    try {
        await connectDB();

        await Remedy.deleteMany();
        console.log("Old data removed");

        await Remedy.insertMany(data);
        console.log("Data inserted");

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();