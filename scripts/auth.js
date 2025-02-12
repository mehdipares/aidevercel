const jwt = require('jsonwebtoken');

exports.checkJWT = (req, res, next) => {
    // Récupérer le token depuis les cookies ou les headers
    let token = req.cookies.authToken || req.headers['authorization'];

    // Vérifiez si le token commence par 'Bearer'
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Supprime "Bearer " pour obtenir le token brut
    }

    if (!token) {
        console.error('Aucun token fourni.');
        return res.redirect('/login'); // Redirige si aucun token
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Erreur de vérification du token :', err.message);
            return res.redirect('/login'); // Redirige si le token est invalide ou expiré
        }

        req.decoded = decoded; // Ajoute les informations décodées à la requête
        next(); // Passe à la prochaine étape du middleware ou de la route
    });
};