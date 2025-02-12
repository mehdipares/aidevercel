const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const User = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Le nom est requis']
    },
    firstname: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: [true, `L'email est requis`],
        unique: true, // index unique
        lowercase: true
    },
    password: {
        type: String,
        trim: true,
    }
}, {
    // ajoute 2 champs au doc createdAt et updatedAt
    timestamps: true
});

// Hash le mot de passe quand il est modifié ou créé
User.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // Vérifiez si le mot de passe est déjà haché
    const isHashed = /^\$2[aby]\$.{56}$/.test(this.password);
    if (!isHashed) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', User);