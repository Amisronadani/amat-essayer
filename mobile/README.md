# AMATORA — Application mobile (prototype pédagogique)

⚠️ **Application de démonstration, non officielle.** Les candidats et partis
sont entièrement fictifs. Cette application ne représente aucun scrutin réel
et n'est affiliée à aucune institution électorale du Burundi. Un bandeau
d'avertissement est affiché sur chaque écran pour le rappeler.

## Stack

- React Native + Expo
- React Navigation (pile + onglets)
- Icônes : `@expo/vector-icons` (Ionicons)
- Appels réseau : Axios, session stockée avec AsyncStorage

## Palette (vert / gris / blanc)

| Rôle | Couleur |
|---|---|
| Vert principal | `#1E8449` |
| Vert vif (accents) | `#2E9E5B` |
| Gris | `#6B7280` |
| Fond | `#F5F7F6` |
| Blanc | `#FFFFFF` |

## Installation

```bash
cd mobile
npm install
```

Avant de lancer l'app, ouvrez `src/services/api.js` et vérifiez `BASE_URL` :

- Émulateur Android → `http://10.0.2.2:4000/api`
- Simulateur iOS → `http://localhost:4000/api`
- Appareil physique (via Expo Go) → `http://<IP_DE_VOTRE_ORDINATEUR>:4000/api`

Démarrez le backend (voir `../backend/README.md`), puis lancez l'app :

```bash
npx expo start
```

Scannez le QR code avec l'app **Expo Go**, ou lancez un émulateur Android/iOS.

## Parcours de l'application

1. **Inscription / Connexion** — création d'un compte électeur fictif
   (vérification d'âge simulée ≥ 18 ans).
2. **Candidats** — liste des candidats fictifs, sélection puis confirmation.
3. **Confirmation du vote** — récapitulatif avant validation définitive
   (un seul vote autorisé par compte).
4. **Résultats** — résultats agrégés en temps réel, par pourcentage.
5. **Profil** — informations du compte, statut de vote, déconnexion.

## Ce que ce prototype n'est pas

Ce projet illustre l'architecture technique d'un système de vote (auth,
vote unique, résultats agrégés) à des fins d'apprentissage. Il
**n'implémente pas** les garanties nécessaires à un vote en ligne réel à
grande échelle : vérification d'identité forte, résistance à la coercition,
audit cryptographique vérifiable, résilience aux attaques. Un vote réel
reste organisé par l'institution électorale officielle compétente.
