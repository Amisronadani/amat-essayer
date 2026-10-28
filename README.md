# AMATORA

> ⚠️ **Prototype pédagogique — non officiel.** Candidats, partis et résultats
> sont entièrement **fictifs**. Cette application ne représente aucun scrutin
> réel, n'est affiliée à aucune institution électorale, et ne doit pas être
> utilisée pour un vote réel. Un bandeau d'avertissement apparaît sur chaque
> écran de l'application mobile.

Application illustrant l'architecture technique d'un système de vote citoyen :
inscription, authentification, vote unique par compte, résultats agrégés en
temps réel — à des fins d'apprentissage du développement mobile et backend.

## Structure du projet

```
AMATORA/
├── backend/    -> API Node.js + Express + MySQL (voir backend/README.md)
└── mobile/     -> Application React Native + Expo (voir mobile/README.md)
```

## Démarrage rapide

1. **Backend** :
   ```bash
   cd backend
   npm install
   cp .env.example .env      # configurez vos identifiants MySQL
   mysql -u root -p < database/schema.sql
   npm run dev
   ```

2. **Mobile** :
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

Consultez le README de chaque dossier pour le détail des endpoints, de la
configuration réseau et du parcours utilisateur.

## Pourquoi les candidats sont fictifs

Ce projet a été volontairement construit avec des candidats et partis
imaginaires ("Candidat A", "Candidat B"...) plutôt qu'avec de vrais noms liés
à l'élection présidentielle burundaise de 2027. Un système de vote en ligne
réel, ouvert à toute une population, pose des problèmes de sécurité et de
légitimité qu'aucun prototype ne résout (vérification d'identité, unicité du
vote, anonymat vérifiable, résistance au piratage et à la coercition). Ce
dépôt sert donc uniquement à apprendre l'architecture technique, pas à
organiser un scrutin réel.
