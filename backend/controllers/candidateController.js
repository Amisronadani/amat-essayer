const pool = require('../config/db');

/** Liste tous les candidats (données fictives, démo) */
async function listerCandidats(req, res) {
  try {
    const [candidats] = await pool.query(
      'SELECT id, nom_candidat, parti_fictif, slogan, couleur_parti, photo_url FROM candidats ORDER BY ordre_affichage ASC'
    );
    res.json({ success: true, candidats });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

module.exports = { listerCandidats };
