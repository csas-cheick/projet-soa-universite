const express = require('express');
//const cors = require('cors'); 
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = 3000;

// 1. Connexion Base de Données
connectDB();

// 2. Middlewares Globaux
app.use(express.json());
//app.use(cors());

// 3. Enregistrement des Routes
// Toutes les routes dans studentRoutes commenceront par /api/etudiants
app.use('/api/etudiants', studentRoutes);

// 4. Route de santé (Health Check)
app.get('/', (req, res) => {
    res.send("Service Étudiants (Node.js MVC) est en ligne 🚀");
});

// 5. Démarrage Serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});