const express = require('express');
const router = express.Router();
const { inscrire, connecter, profil } = require('../controllers/authController');
const { verifierToken } = require('../middleware/auth');

router.post('/inscription', inscrire);
router.post('/connexion', connecter);
router.get('/profil', verifierToken, profil);

module.exports = router;
