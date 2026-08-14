const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Vérifie le jeton JWT envoyé dans l'en-tête Authorization: Bearer <token>
 * et attache l'utilisateur décodé à req.utilisateur.
 */
function verifierToken(req, res, next) {
  const enTete = req.headers['authorization'];
  const token = enTete && enTete.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentification requise.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Session invalide ou expirée.' });
    }
    req.utilisateur = decoded;
    next();
  });
}

module.exports = { verifierToken };
