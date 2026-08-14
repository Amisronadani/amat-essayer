const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

/**
 * Génère un identifiant électeur fictif du type AMT-000123
 * (à but de démonstration uniquement — ne remplace aucun document officiel).
 */
function genererNumeroElecteurDemo(id) {
  return `AMT-${String(id).padStart(6, '0')}`;
}

/** Inscription d'un nouvel utilisateur (démo) */
async function inscrire(req, res) {
  const { nom, prenom, email, mot_de_passe, numero_cni, province_id, commune_id, colline_id, sous_colline_id, province, age } = req.body;

  // Validation de l'âge minimum (au moins 18 ans)
  if (age !== undefined && Number(age) < 18) {
    return res.status(403).json({
      success: false,
      message: 'Vous devez avoir au moins 18 ans pour vous inscrire.',
    });
  }

  if (!nom || !prenom || !mot_de_passe || !numero_cni) {
    return res.status(422).json({ success: false, message: 'Tous les champs obligatoires doivent être remplis.' });
  }

  try {
    if (email) {
      const [existants] = await pool.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
      if (existants.length > 0) {
        return res.status(409).json({ success: false, message: 'Un compte existe déjà avec cet email.' });
      }
    }

    const [existantsCni] = await pool.query('SELECT id FROM utilisateurs WHERE numero_cni = ?', [numero_cni]);
    if (existantsCni.length > 0) {
      return res.status(409).json({ success: false, message: 'Un compte existe déjà avec ce numéro CNI.' });
    }

    const hash = await bcrypt.hash(mot_de_passe, 10);

    const [resultat] = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, numero_electeur_demo, numero_cni, province, province_id, commune_id, colline_id, sous_colline_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email || null, hash, 'TEMP', numero_cni, province || null, province_id || null, commune_id || null, colline_id || null, sous_colline_id || null]
    );

    const numeroElecteur = genererNumeroElecteurDemo(resultat.insertId);
    await pool.query('UPDATE utilisateurs SET numero_electeur_demo = ? WHERE id = ?', [numeroElecteur, resultat.insertId]);

    const token = creerToken({ id: resultat.insertId, email });

    res.status(201).json({
      success: true,
      message: 'Inscription réussie (compte de démonstration).',
      token,
      utilisateur: { id: resultat.insertId, nom, prenom, email, numero_electeur_demo: numeroElecteur, numero_cni, a_vote: false },
    });

  } catch (erreur) {
    res.status(500).json({ success: false, message: "Erreur serveur lors de l'inscription : " + erreur.message });
  }
}

/** Connexion */
async function connecter(req, res) {
  const { numero_cni, mot_de_passe } = req.body;

  if (!numero_cni || !mot_de_passe) {
    return res.status(422).json({ success: false, message: 'Numéro CNI et mot de passe requis.' });
  }

  try {
    const [lignes] = await pool.query('SELECT * FROM utilisateurs WHERE numero_cni = ?', [numero_cni]);
    if (lignes.length === 0) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const utilisateur = lignes[0];
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe_hash);
    if (!motDePasseValide) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const token = creerToken({ id: utilisateur.id, email: utilisateur.email });

    res.json({
      success: true,
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        numero_electeur_demo: utilisateur.numero_electeur_demo,
        numero_cni: utilisateur.numero_cni,
        province: utilisateur.province,
        a_vote: !!utilisateur.a_vote,
      },
    });

  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion : ' + erreur.message });
  }
}

/** Profil de l'utilisateur connecté */
async function profil(req, res) {
  try {
    const [lignes] = await pool.query(
      `SELECT u.id, u.nom, u.prenom, u.email, u.numero_electeur_demo, u.numero_cni, u.province, u.a_vote,
              p.nom AS nom_province, c.nom AS nom_commune,
              col.nom AS nom_colline, sc.nom AS nom_sous_colline
       FROM utilisateurs u
       LEFT JOIN provinces p ON u.province_id = p.id
       LEFT JOIN communes c ON u.commune_id = c.id
       LEFT JOIN collines col ON u.colline_id = col.id
       LEFT JOIN sous_collines sc ON u.sous_colline_id = sc.id
       WHERE u.id = ?`,
      [req.utilisateur.id]
    );
    if (lignes.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }
    res.json({ success: true, utilisateur: lignes[0] });
  } catch (erreur) {
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + erreur.message });
  }
}

function creerToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '7d' });
}

module.exports = { inscrire, connecter, profil };
