const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Reservation = require('../models/reservation');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/Catwaysmarina', {
    serverSelectionTimeoutMS: 30000, // Augmenter le délai d'attente à 30 secondes
}).then(() => {
    console.log('Connected to MongoDB');
    importData(); // Lancer l'importation des données après la connexion
}).catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Arrêter le script en cas d'erreur de connexion
});

// Charger les données depuis le fichier JSON
const dataPath = path.join(__dirname, '../data/reservation.js');
const reservationsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Importer les données dans MongoDB
const importData = async () => {
    try {
        await Reservation.deleteMany(); // Supprimer les anciennes données si nécessaire
        await Reservation.insertMany(reservationsData); // Ajouter les nouvelles données
        console.log('Reservations data imported successfully');
        process.exit();
    } catch (error) {
        console.error('Error importing reservations data:', error);
        process.exit(1);
    }
};

importData();