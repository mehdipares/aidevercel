const express = require('express');
const router = express.Router();
const service = require('../services/users');

// Route GET : Afficher la page d'inscription
router.get('/register', (req, res) => {
    res.render('register', { title: 'Inscription', error: null });
});

// Route POST : Inscription
router.post('/register', async (req, res) => {
    const { name, firstname, email, password } = req.body;

    try {
        console.log('--- Début de l\'inscription ---');
        console.log('Données reçues :', { name, firstname, email });

        // Appeler directement le service "add" pour créer l'utilisateur
        await service.add(req, res);

        console.log('--- Fin de l\'inscription ---');
    } catch (error) {
        console.error('Erreur inattendue lors de l\'inscription :', error.message);
        console.error('Stack de l\'erreur :', error.stack);
        console.log('--- Fin de l\'inscription (échec inattendu) ---');
        res.render('register', { title: 'Inscription', error: 'Une erreur est survenue. Réessayez.' });
    }
});


// Routes REST pour la gestion des utilisateurs
router.post('/add', service.add); // Route API
router.get('/:id', service.getById); // Lire un utilisateur par ID
router.patch('/:id', service.update); // Modifier un utilisateur
router.delete('/:id', service.delete); // Supprimer un utilisateur
router.get('/', service.getAll); // Lister tous les utilisateurs

// Route POST : Authentification (API)
router.post('/authenticate', service.authenticate);

module.exports = router;