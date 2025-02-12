const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservations');
const { checkJWT } = require('../scripts/auth'); // Middleware pour la validation du token

// Route : Récupérer toutes les réservations (route protégée)
router.get('/', checkJWT, async (req, res) => {
    try {
        console.log("🔍 Requête GET /api/reservations reçue");
        console.log("🔑 Utilisateur authentifié :", req.user);
        
        const reservations = await Reservation.find();
        console.log("✅ Réservations récupérées :", reservations);
        
        res.status(200).json(reservations);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des réservations :", error);
        res.status(500).json({ error: error.message });
    }
});

// Route : Récupérer une réservation spécifique (route protégée)
router.get('/:id', checkJWT, async (req, res) => {
    try {
        console.log(`🔍 Requête GET /api/reservations/${req.params.id} reçue`);
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            console.warn("⚠️ Réservation non trouvée");
            return res.status(404).json({ error: 'Reservation not found' });
        }
        console.log("✅ Réservation trouvée :", reservation);
        res.status(200).json(reservation);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de la réservation :", error);
        res.status(500).json({ error: error.message });
    }
});

// Route : Ajouter une nouvelle réservation (route protégée)
router.post('/', checkJWT, async (req, res) => {
    try {
        console.log("➕ Tentative d'ajout d'une réservation", req.body);
        const newReservation = new Reservation(req.body);
        const savedReservation = await newReservation.save();
        console.log("✅ Réservation ajoutée :", savedReservation);
        res.status(201).json(savedReservation);
    } catch (error) {
        console.error("❌ Erreur lors de l'ajout de la réservation :", error);
        res.status(400).json({ error: error.message });
    }
});

// Route : Mettre à jour une réservation existante (route protégée)
router.put('/:id', checkJWT, async (req, res) => {
    try {
        console.log(`✏️ Tentative de mise à jour de la réservation ${req.params.id}`);
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedReservation) {
            console.warn("⚠️ Réservation non trouvée pour mise à jour");
            return res.status(404).json({ error: 'Reservation not found' });
        }
        console.log("✅ Réservation mise à jour :", updatedReservation);
        res.status(200).json(updatedReservation);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la réservation :", error);
        res.status(400).json({ error: error.message });
    }
});

// Route : Supprimer une réservation (route protégée)
router.delete('/:id', checkJWT, async (req, res) => {
    try {
        console.log(`🗑️ Tentative de suppression de la réservation ${req.params.id}`);
        const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!deletedReservation) {
            console.warn("⚠️ Réservation non trouvée pour suppression");
            return res.status(404).json({ error: 'Reservation not found' });
        }
        console.log("✅ Réservation supprimée avec succès");
        res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de la réservation :", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
