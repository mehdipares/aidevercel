// Import des modules requis
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Récupérer tous les utilisateurs
exports.getAll = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Cachez les mots de passe dans la réponse
        console.log('Tous les utilisateurs récupérés:', users);
        return res.status(200).json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Récupérer un utilisateur par ID
exports.getById = async (req, res, next) => {
    const id = req.params.id;

    try {
        let user = await User.findById(id);

        if (user) {
            return res.status(200).json(user);
        }
        return res.status(404).json({ error: 'user_not_found' });
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

exports.add = async (req, res, next) => {
    const { name, firstname, email, password } = req.body;

    console.log('Tentative d\'ajout d\'utilisateur avec les informations :', {
        name,
        firstname,
        email,
    });

    if (!name || !firstname || !email || !password) {
        console.error('Erreur : Tous les champs sont requis');
        
        // Vérifier si la demande vient d'une page EJS ou d'une API
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(400).json({ error: 'All fields are required' });
        } else {
            return res.render('register', { title: 'Inscription', error: 'Tous les champs sont requis.' });
        }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Mot de passe haché :', hashedPassword);

        const newUser = new User({
            name,
            firstname,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        console.log('Utilisateur enregistré :', savedUser);

        // Réponse pour les appels API
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json(savedUser);
        }

        // Redirection pour les formulaires EJS
        return res.redirect('/login');
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur :', error.message);

        // Gestion des doublons ou autres erreurs
        const errorMessage = error.code === 11000
            ? 'Cet email est déjà utilisé.'
            : 'Une erreur inattendue est survenue.';

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ error: errorMessage });
        } else {
            return res.render('register', { title: 'Inscription', error: errorMessage });
        }
    }
};
// Modifier un utilisateur
exports.update = async (req, res, next) => {
    const id = req.params.id;
    const updates = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true } // Retourne l'utilisateur mis à jour et applique les validateurs
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'user_not_found' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Supprimer un utilisateur
exports.delete = async (req, res, next) => {
    const id = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: 'user_not_found' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

// Authentifier un utilisateur
exports.authenticate = async (req, res, next) => {
    const { email, password } = req.body;

    console.log('--- Début de l\'authentification ---');
    console.log('Tentative d\'authentification avec l\'email :', email);

    if (!email || !password) {
        console.error('Erreur : Email ou mot de passe manquant');
        return res.status(400).json({ error: 'email_and_password_required' });
    }

    try {
        console.log('Recherche de l\'utilisateur dans la base de données...');
        const user = await User.findOne({ email }).select('-__v -createdAt -updatedAt');

        if (!user) {
            console.error('Erreur : Utilisateur non trouvé pour l\'email :', email);
            return res.status(404).json({ error: 'user_not_found' });
        }

        console.log('Utilisateur trouvé :', {
            id: user._id,
            email: user.email,
            name: user.name,
            firstname: user.firstname,
        });

        console.log('Comparaison des mots de passe...');
        const isMatch = await bcrypt.compare(password, user.password);

        console.log('Mot de passe fourni :', password);
        console.log('Mot de passe dans la base :', user.password);
        console.log('Le mot de passe correspond-il ?', isMatch);

        if (!isMatch) {
            console.error('Erreur : Mot de passe incorrect pour l\'email :', email);
            return res.status(403).json({ error: 'wrong_credentials' });
        }

        console.log('Génération du token JWT...');
        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        console.log('Authentification réussie, token généré :', token);

        res.header('Authorization', 'Bearer ' + token);
        return res.status(200).json({ message: 'authenticate_succeed', token });
    } catch (error) {
        console.error('Erreur lors de l\'authentification :', error.message);
        return res.status(500).json({ error: error.message });
    } finally {
        console.log('--- Fin de l\'authentification ---');
    }
};