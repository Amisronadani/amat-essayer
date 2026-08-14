-- =========================================================
-- AMATORA — Base de données (application de DÉMONSTRATION)
-- Ne représente aucun scrutin réel. Candidats et partis fictifs.
-- =========================================================

CREATE DATABASE IF NOT EXISTS amatora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE amatora_db;

-- Tables géographiques
CREATE TABLE IF NOT EXISTS provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS communes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    province_id INT,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS collines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    commune_id INT,
    FOREIGN KEY (commune_id) REFERENCES communes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sous_collines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    colline_id INT,
    FOREIGN KEY (colline_id) REFERENCES collines(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Électeurs inscrits (démo)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    numero_electeur_demo VARCHAR(30) NOT NULL UNIQUE, -- identifiant fictif (ne remplace aucune pièce officielle)
    numero_cni VARCHAR(50) NOT NULL UNIQUE,
    province VARCHAR(100),
    province_id INT,
    commune_id INT,
    colline_id INT,
    sous_colline_id INT,
    a_vote BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE SET NULL,
    FOREIGN KEY (commune_id) REFERENCES communes(id) ON DELETE SET NULL,
    FOREIGN KEY (colline_id) REFERENCES collines(id) ON DELETE SET NULL,
    FOREIGN KEY (sous_colline_id) REFERENCES sous_collines(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Candidats fictifs (démo)
CREATE TABLE IF NOT EXISTS candidats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_candidat VARCHAR(100) NOT NULL,
    parti_fictif VARCHAR(150) NOT NULL,
    slogan VARCHAR(255),
    couleur_parti VARCHAR(10) DEFAULT '#2E9E5B',
    photo_url VARCHAR(255),
    ordre_affichage INT DEFAULT 0
) ENGINE=InnoDB;

-- Votes (un seul vote possible par utilisateur, garanti par la contrainte UNIQUE)
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL UNIQUE,
    candidat_id INT NOT NULL,
    horodatage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidat_id) REFERENCES candidats(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Données de démonstration : candidats 100% fictifs
-- ---------------------------------------------------------
INSERT INTO candidats (nom_candidat, parti_fictif, slogan, couleur_parti, photo_url, ordre_affichage) VALUES
('Candidat A', 'CNL', 'Amahoro n''abantu', '#E63946', NULL, 1),
('Candidat B', 'CNDD-FDD', 'Uburundi bwacu', '#1E8449', NULL, 2),
('Candidat C', 'IPEDE ZIGAMIBANGA', 'Iterambere ry''igihugu', '#F4A261', NULL, 3),
('Candidat D', 'UPRONA', 'Ubumwe n''amajambere', '#2563EB', NULL, 4),
('Candidat E', 'FRODEBU', 'Demokarasi n''ubutungane', '#7C3AED', NULL, 5),
('Candidat F', 'FRODEBU NYAKURI', 'Ukuri n''ubutungane', '#D97706', NULL, 6);
