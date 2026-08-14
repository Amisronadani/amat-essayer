const express = require('express');
const router = express.Router();
const { voter, resultats, statutVote, resultatsParZone } = require('../controllers/voteController');
const { verifierToken } = require('../middleware/auth');

router.post('/', verifierToken, voter);
router.get('/resultats', resultats); // consultables publiquement, aucune donnée individuelle
router.get('/resultats/par-zone', resultatsParZone);
router.get('/statut', verifierToken, statutVote);

module.exports = router;
