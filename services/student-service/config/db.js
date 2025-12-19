const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://dbUser:root@university.un0krqn.mongodb.net/student_univ_db?appName=university&retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Service Étudiants (Node) connecté à MongoDB !");
    } catch (err) {
        console.error("Erreur de connexion Mongo:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;