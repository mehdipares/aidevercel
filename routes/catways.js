const express = require('express');
const router = express.Router();
const Catway = require('../models/catway.js');
const { checkJWT } = require('../scripts/auth'); // Middleware pour la validation du token

// GET : Liste des catways (route protégée)
router.get('/', checkJWT, async (req, res) => {
    try {
        const catways = await Catway.find();
        console.log('Catways fetched:', catways); // Log des données récupérées
        res.status(200).json(catways);
    } catch (error) {
        console.error('Error fetching catways:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET : Détails d'un catway par son numéro (route protégée)
router.get('/:catwayNumber', checkJWT, async (req, res) => {
    try {
        const catway = await Catway.findOne({ catwayNumber: req.params.catwayNumber });
        if (catway) {
            res.status(200).json(catway);
        } else {
            res.status(404).json({ error: 'Catway not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST : Ajouter un nouveau catway (route protégée)
router.post('/', checkJWT, async (req, res) => {
    console.log('--- Début de la création d\'un catway ---');
    console.log('Données reçues dans la requête :', req.body);

    try {
        const newCatway = new Catway(req.body);
        console.log('Instance Catway créée :', newCatway);

        const savedCatway = await newCatway.save();
        console.log('Catway sauvegardé dans la base de données :', savedCatway);

        res.status(201).json(savedCatway);
        console.log('--- Fin de la création d\'un catway avec succès ---');
    } catch (error) {
        console.error('Erreur lors de la création d\'un catway :', error.message);
        console.error('Stack de l\'erreur :', error.stack);

        res.status(400).json({ error: error.message });
    }
});

// DELETE : Supprimer un catway par son numéro (route protégée)
router.delete('/:catwayNumber', checkJWT, async (req, res) => {
    try {
        const deletedCatway = await Catway.findOneAndDelete({ catwayNumber: req.params.catwayNumber });
        if (!deletedCatway) {
            return res.status(404).json({ error: 'Catway not found' });
        }
        console.log('Catway deleted:', deletedCatway); // Log du catway supprimé
        res.status(200).json({ message: 'Catway deleted successfully', catway: deletedCatway });
    } catch (error) {
        console.error('Error deleting catway:', error);
        res.status(500).json({ error: error.message });
    }
});
// PATCH : Modifier l'état d'un catway
router.patch('/:catwayNumber', checkJWT, async (req, res) => {
    console.log('--- Début de la modification d\'un catway ---');
    console.log('Numéro du catway :', req.params.catwayNumber);
    console.log('Données reçues :', req.body);

    try {
        const updatedCatway = await Catway.findOneAndUpdate(
            { catwayNumber: req.params.catwayNumber },
            { $set: { catwayState: req.body.catwayState } },
            { new: true, runValidators: true }
        );

        if (!updatedCatway) {
            console.error('Catway introuvable');
            return res.status(404).json({ error: 'Catway not found' });
        }

        console.log('Catway mis à jour :', updatedCatway);
        res.status(200).json(updatedCatway);
    } catch (error) {
        console.error('Erreur lors de la modification du catway :', error.message);
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;