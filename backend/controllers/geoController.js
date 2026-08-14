const pool = require('../config/db');

async function listerProvinces(req, res) {
  try {
    const [lignes] = await pool.query('SELECT * FROM provinces ORDER BY nom');
    res.json({ success: true, data: lignes });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

async function listerCommunes(req, res) {
  try {
    const { provinceId } = req.params;
    const [lignes] = await pool.query('SELECT * FROM communes WHERE province_id = ? ORDER BY nom', [provinceId]);
    res.json({ success: true, data: lignes });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

async function listerCollines(req, res) {
  try {
    const { communeId } = req.params;
    const [lignes] = await pool.query('SELECT * FROM collines WHERE commune_id = ? ORDER BY nom', [communeId]);
    res.json({ success: true, data: lignes });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

async function listerSousCollines(req, res) {
  try {
    const { collineId } = req.params;
    const [lignes] = await pool.query('SELECT * FROM sous_collines WHERE colline_id = ? ORDER BY nom', [collineId]);
    res.json({ success: true, data: lignes });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

module.exports = {
  listerProvinces,
  listerCommunes,
  listerCollines,
  listerSousCollines
};
