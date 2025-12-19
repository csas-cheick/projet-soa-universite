const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const verifyToken = require('../middleware/authMiddleware');

// Toutes les routes ici sont protégées par "verifyToken"

// 1. Ajouter un étudiant
router.post('/', verifyToken, async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Lister tous les étudiants
router.get('/', verifyToken, async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Chercher par ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Étudiant non trouvé" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Modifier
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updated = await Student.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Renvoie l'objet modifié
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Supprimer
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Étudiant supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;