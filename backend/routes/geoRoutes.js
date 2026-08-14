const express = require('express');
const router = express.Router();
const { listerProvinces, listerCommunes, listerCollines, listerSousCollines } = require('../controllers/geoController');

router.get('/provinces', listerProvinces);
router.get('/communes/:provinceId', listerCommunes);
router.get('/collines/:communeId', listerCollines);
router.get('/sous-collines/:collineId', listerSousCollines);

module.exports = router;
