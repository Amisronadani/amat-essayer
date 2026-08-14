const pool = require('../config/db');

/** Enregistre le vote de l'utilisateur connecté (une seule fois, garanti en base) */
async function voter(req, res) {
  const utilisateurId = req.utilisateur.id;
  const { candidat_id } = req.body;

  if (!candidat_id) {
    return res.status(422).json({ success: false, message: 'Veuillez sélectionner un candidat.' });
  }

  const connexion = await pool.getConnection();
  try {
    await connexion.beginTransaction();

    // Verrouille la ligne utilisateur pour éviter un double-vote en cas de requêtes simultanées
    const [utilisateurs] = await connexion.query(
      'SELECT a_vote FROM utilisateurs WHERE id = ? FOR UPDATE',
      [utilisateurId]
    );

    if (utilisateurs.length === 0) {
      await connexion.rollback();
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    if (utilisateurs[0].a_vote) {
      await connexion.rollback();
      return res.status(409).json({ success: false, message: 'Vous avez déjà voté (démo : un seul vote autorisé par compte).' });
    }

    const [candidats] = await connexion.query('SELECT id FROM candidats WHERE id = ?', [candidat_id]);
    if (candidats.length === 0) {
      await connexion.rollback();
      return res.status(404).json({ success: false, message: 'Candidat introuvable.' });
    }

    await connexion.query(
      'INSERT INTO votes (utilisateur_id, candidat_id) VALUES (?, ?)',
      [utilisateurId, candidat_id]
    );
    await connexion.query('UPDATE utilisateurs SET a_vote = TRUE WHERE id = ?', [utilisateurId]);

    await connexion.commit();

    res.status(201).json({ success: true, message: 'Votre vote de démonstration a été enregistré. Merci !' });

  } catch (erreur) {
    await connexion.rollback();
    if (erreur.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Vous avez déjà voté (démo : un seul vote autorisé par compte).' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur lors du vote : ' + erreur.message });
  } finally {
    connexion.release();
  }
}

/** Résultats agrégés (aucune donnée individuelle n'est exposée) */
async function resultats(req, res) {
  try {
    const [lignes] = await pool.query(`
      SELECT c.id, c.nom_candidat, c.parti_fictif, c.couleur_parti,
             COUNT(v.id) AS nombre_votes
      FROM candidats c
      LEFT JOIN votes v ON v.candidat_id = c.id
      GROUP BY c.id
      ORDER BY nombre_votes DESC
    `);

    const totalVotes = lignes.reduce((somme, ligne) => somme + ligne.nombre_votes, 0);

    const resultatsAvecPourcentage = lignes.map(ligne => ({
      ...ligne,
      pourcentage: totalVotes > 0 ? Number(((ligne.nombre_votes / totalVotes) * 100).toFixed(1)) : 0,
    }));

    res.json({ success: true, total_votes: totalVotes, resultats: resultatsAvecPourcentage });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

/** Vérifie si l'utilisateur connecté a déjà voté */
async function statutVote(req, res) {
  try {
    const [lignes] = await pool.query('SELECT a_vote FROM utilisateurs WHERE id = ?', [req.utilisateur.id]);
    if (lignes.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }
    res.json({ success: true, a_vote: !!lignes[0].a_vote });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

/** Résultats par zone géographique */
async function resultatsParZone(req, res) {
  try {
    const { province_id, commune_id, colline_id, sous_colline_id } = req.query;
    
    let whereClause = [];
    let params = [];
    
    if (province_id) {
      whereClause.push('u.province_id = ?');
      params.push(province_id);
    }
    if (commune_id) {
      whereClause.push('u.commune_id = ?');
      params.push(commune_id);
    }
    if (colline_id) {
      whereClause.push('u.colline_id = ?');
      params.push(colline_id);
    }
    if (sous_colline_id) {
      whereClause.push('u.sous_colline_id = ?');
      params.push(sous_colline_id);
    }

    const whereStr = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';

    const [lignes] = await pool.query(`
      SELECT c.id, c.nom_candidat, c.parti_fictif, c.couleur_parti,
             COUNT(v.id) AS nombre_votes
      FROM candidats c
      LEFT JOIN votes v ON v.candidat_id = c.id
      LEFT JOIN utilisateurs u ON v.utilisateur_id = u.id
      ${whereStr}
      GROUP BY c.id
      ORDER BY nombre_votes DESC
    `, params);

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as inscrits,
        SUM(CASE WHEN a_vote = 1 THEN 1 ELSE 0 END) as votants
      FROM utilisateurs u
      ${whereStr}
    `, params);

    const inscrits = stats[0].inscrits || 0;
    const votants = stats[0].votants || 0;
    const totalVotes = lignes.reduce((somme, ligne) => somme + ligne.nombre_votes, 0);

    const resultatsAvecPourcentage = lignes.map(ligne => ({
      ...ligne,
      pourcentage: totalVotes > 0 ? Number(((ligne.nombre_votes / totalVotes) * 100).toFixed(1)) : 0,
    }));

    res.json({ 
      success: true, 
      stats: { inscrits, votants }, 
      total_votes: totalVotes, 
      resultats: resultatsAvecPourcentage 
    });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

module.exports = { voter, resultats, statutVote, resultatsParZone };
