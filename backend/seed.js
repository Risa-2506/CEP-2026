require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");


const Remedy = require("./models/Remedy.model");
const Doctor = require("./models/Doctor");

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

const doctorsData = [
  { name: "Dr. Asha Patil", specialty: "Cardiologist", location: "Mumbai", contact: "9000000001", email: "asha.patil@example.com" },
  { name: "Dr. Rajesh Kumar", specialty: "Neurologist", location: "Delhi", contact: "9000000002", email: "rajesh.kumar@example.com" },
  { name: "Dr. Sneha Joshi", specialty: "Dermatologist", location: "Pune", contact: "9000000003", email: "sneha.joshi@example.com" },
  { name: "Dr. Amit Sharma", specialty: "Orthopedic", location: "Jaipur", contact: "9000000004", email: "amit.sharma@example.com" },
  { name: "Dr. Priya Nair", specialty: "Pediatrician", location: "Kochi", contact: "9000000005", email: "priya.nair@example.com" },
  { name: "Dr. Karan Mehta", specialty: "Dentist", location: "Ahmedabad", contact: "9000000006", email: "karan.mehta@example.com" },
  { name: "Dr. Neha Gupta", specialty: "Gynecologist", location: "Chandigarh", contact: "9000000007", email: "neha.gupta@example.com" },
  { name: "Dr. Rohit Verma", specialty: "ENT", location: "Lucknow", contact: "9000000008", email: "rohit.verma@example.com" },
  { name: "Dr. Pooja Singh", specialty: "Psychiatrist", location: "Bhopal", contact: "9000000009", email: "pooja.singh@example.com" },
  { name: "Dr. Vikram Reddy", specialty: "Oncologist", location: "Hyderabad", contact: "9000000010", email: "vikram.reddy@example.com" },
  { name: "Dr. Meena Iyer", specialty: "Endocrinologist", location: "Chennai", contact: "9000000011", email: "meena.iyer@example.com" },
  { name: "Dr. Anil Deshmukh", specialty: "General Physician", location: "Nagpur", contact: "9000000012", email: "anil.deshmukh@example.com" },
  { name: "Dr. Kavita Shah", specialty: "Ophthalmologist", location: "Surat", contact: "9000000013", email: "kavita.shah@example.com" },
  { name: "Dr. Sanjay Kulkarni", specialty: "Urologist", location: "Pune", contact: "9000000014", email: "sanjay.kulkarni@example.com" },
  { name: "Dr. Ritu Malhotra", specialty: "Radiologist", location: "Delhi", contact: "9000000015", email: "ritu.malhotra@example.com" },
  { name: "Dr. Deepak Yadav", specialty: "Pulmonologist", location: "Gurgaon", contact: "9000000016", email: "deepak.yadav@example.com" },
  { name: "Dr. Shalini Menon", specialty: "Pathologist", location: "Bengaluru", contact: "9000000017", email: "shalini.menon@example.com" },
  { name: "Dr. Harish Chandra", specialty: "Gastroenterologist", location: "Varanasi", contact: "9000000018", email: "harish.chandra@example.com" },
  { name: "Dr. Nikhil Bansal", specialty: "Nephrologist", location: "Noida", contact: "9000000019", email: "nikhil.bansal@example.com" },
  { name: "Dr. Swati Agarwal", specialty: "Anesthesiologist", location: "Indore", contact: "9000000020", email: "swati.agarwal@example.com" }
];


const seedData = async () => {
    try {
        await connectDB();

        await Remedy.deleteMany();
        console.log("Old data removed");

        await Remedy.insertMany(data);
        console.log("Data inserted");

        await Doctor.deleteMany();
        console.log("Old doctor data removed");
        await Doctor.insertMany(doctorsData);
        console.log("Doctors data inserted");

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();

