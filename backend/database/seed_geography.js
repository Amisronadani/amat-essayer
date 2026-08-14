const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
  const dataPath = path.join(__dirname, '../../burundi.json');
  console.log(`Lecture du fichier ${dataPath}...`);
  
  if (!fs.existsSync(dataPath)) {
    console.error(`Erreur: Fichier introuvable à ${dataPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error("Erreur de parsing JSON", err);
    process.exit(1);
  }

  const provinces = Object.keys(data);
  console.log(`${provinces.length} provinces trouvées.`);

  let db;
  try {
    db = await pool.getConnection();
    
    // On nettoie les tables d'abord (optionnel mais utile en dev)
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE sous_collines');
    await db.query('TRUNCATE TABLE collines');
    await db.query('TRUNCATE TABLE communes');
    await db.query('TRUNCATE TABLE provinces');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const nomProvince of provinces) {
      console.log(`Insertion de la province: ${nomProvince}`);
      const [resProv] = await db.query('INSERT INTO provinces (nom) VALUES (?)', [nomProvince]);
      const provinceId = resProv.insertId;

      const communes = data[nomProvince];
      for (const nomCommune of Object.keys(communes)) {
        const [resComm] = await db.query('INSERT INTO communes (nom, province_id) VALUES (?, ?)', [nomCommune, provinceId]);
        const communeId = resComm.insertId;

        const collines = communes[nomCommune];
        for (const nomColline of Object.keys(collines)) {
          const [resColl] = await db.query('INSERT INTO collines (nom, commune_id) VALUES (?, ?)', [nomColline, communeId]);
          const collineId = resColl.insertId;

          const sousCollines = collines[nomColline];
          for (const nomSousColline of sousCollines) {
            await db.query('INSERT INTO sous_collines (nom, colline_id) VALUES (?, ?)', [nomSousColline, collineId]);
          }
        }
      }
    }

    console.log("Terminé avec succès !");
  } catch (err) {
    console.error("Erreur d'insertion dans la base:", err);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
}

seed();
