# AMATORA — Backend (API de démonstration)

⚠️ **Ceci est un prototype pédagogique.** Candidats et partis fictifs.
Cette application ne représente aucun scrutin réel, n'a aucun caractère
officiel et n'est affiliée à aucune institution électorale.

## Stack

- Node.js + Express
- MySQL (via `mysql2`)
- Authentification par JWT
- Mots de passe hachés avec `bcryptjs`

## Installation

```bash
cd backend
npm install
cp .env.example .env   # puis modifiez les identifiants MySQL
```

Créez la base de données :

```bash
mysql -u root -p < database/schema.sql
```

Démarrez le serveur :

```bash
npm run dev     # avec rechargement automatique (nodemon)
# ou
npm start
```

L'API écoute par défaut sur `http://localhost:4000`.

## Endpoints principaux

| Méthode | Route                  | Description                                  | Auth |
|---------|------------------------|-----------------------------------------------|------|
| POST    | `/api/auth/inscription`| Créer un compte électeur (démo)               | Non  |
| POST    | `/api/auth/connexion`  | Se connecter, reçoit un token JWT             | Non  |
| GET     | `/api/auth/profil`     | Profil de l'utilisateur connecté              | Oui  |
| GET     | `/api/candidats`       | Liste des candidats fictifs                   | Oui  |
| POST    | `/api/votes`           | Enregistrer un vote (une seule fois/compte)   | Oui  |
| GET     | `/api/votes/resultats` | Résultats agrégés en temps réel               | Non  |
| GET     | `/api/votes/statut`    | Vérifie si l'utilisateur a déjà voté          | Oui  |

## Garanties du prototype (à but pédagogique)

- Un utilisateur ne peut voter qu'une seule fois (contrainte `UNIQUE` en base
  + transaction avec verrou de ligne `FOR UPDATE`).
- Les résultats n'exposent que des totaux agrégés, jamais le choix individuel
  d'un électeur.
- La vérification d'éligibilité (âge ≥ 18 ans) est **simulée** — ce n'est pas
  un système de vérification d'identité réel.

Ce prototype **n'implémente volontairement pas** les garanties nécessaires à
un vote en ligne réel à grande échelle (vérification d'identité forte,
résistance à la coercition, audit cryptographique vérifiable, résilience face
aux attaques). C'est normal : c'est un exercice d'apprentissage, pas un
système destiné à un usage électoral réel.
