const express = require('express');
const router = express.Router();
const { listerCandidats } = require('../controllers/candidateController');
const { verifierToken } = require('../middleware/auth');

router.get('/', verifierToken, listerCandidats);

module.exports = router;
