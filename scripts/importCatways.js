const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Catway = require('../models/catway'); // Assurez-vous que le chemin est correct

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
const dataPath = path.join(__dirname, '../data/catways.json');
let catwaysData;

try {
    if (!fs.existsSync(dataPath)) {
        console.error(`File not found: ${dataPath}`);
        process.exit(1);
    }
    catwaysData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (error) {
    console.error('Error reading catways.json:', error);
    process.exit(1);
}

// Importer les données dans MongoDB
const importData = async () => {
    try {
        console.log('Deleting old catways data...');
        await Catway.deleteMany(); // Supprimer les anciennes données si nécessaire

        console.log('Inserting new catways data...');
        await Catway.insertMany(catwaysData); // Ajouter les nouvelles données
        console.log('Catways data imported successfully');
        process.exit();
    } catch (error) {
        console.error('Error importing catways data:', error);
        process.exit(1);
    }
};