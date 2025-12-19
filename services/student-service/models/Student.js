const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    classe: String,
    dateInscription: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Student', StudentSchema);