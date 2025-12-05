# NOU Backend API

Backend Node.js avec Express, MySQL et Sequelize ORM pour l'application NOU.

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL (via XAMPP ou autre)
- npm

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
   - Copier `.env.sample` vers `.env`
   - Modifier les valeurs selon votre configuration MySQL XAMPP

```bash
cp .env.sample .env
```

## Configuration MySQL XAMPP

Assurez-vous que MySQL est démarré dans XAMPP. Les valeurs par défaut sont :
- Host: `localhost`
- User: `root`
- Password: (vide par défaut)
- Database: `nou_db` (sera créé automatiquement)

## Initialisation de la base de données

Pour créer la base de données et toutes les tables :

```bash
npm run db:init
```

Ce script va :
- Créer la base de données `nou_db` si elle n'existe pas
- Créer toutes les tables avec Sequelize (membres, cotisations, referrals, podcasts, quiz, quiz_questions, quiz_resultats)
- Configurer toutes les relations et contraintes

## Démarrage du serveur

### Mode développement (avec nodemon)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur le port 4000 (ou celui spécifié dans .env).

## Structure du projet

```
nou-backend/
├── src/
│   ├── config/          # Configuration (DB, Sequelize)
│   ├── controllers/     # Contrôleurs
│   ├── middleware/      # Middlewares
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Routes API
│   ├── services/        # Services métier
│   ├── utils/           # Utilitaires
│   ├── uploads/         # Fichiers uploadés
│   ├── migrations/      # Scripts SQL
│   ├── scripts/         # Scripts d'initialisation
│   └── server.js        # Point d'entrée
├── .env                 # Variables d'environnement
├── .env.sample          # Exemple de configuration
└── package.json
```

## Modèles disponibles

- **Membre** : Gestion des membres
- **Cotisation** : Gestion des paiements
- **Referral** : Système de parrainage
- **Podcast** : Gestion des podcasts
- **Quiz** : Gestion des quiz
- **QuizQuestion** : Questions des quiz
- **QuizResultat** : Résultats des quiz

## API Routes

La route de test est disponible à :
```
GET http://localhost:4000/
```

Réponse : `API NOU OK`

## Scripts disponibles

- `npm start` - Démarrer le serveur en mode production
- `npm run dev` - Démarrer le serveur en mode développement
- `npm run db:init` - Initialiser la base de données et créer les tables

## Technologies utilisées

- Express.js - Framework web
- Sequelize - ORM pour MySQL
- MySQL2 - Driver MySQL
- JWT - Authentification
- Bcryptjs - Hachage de mots de passe
- Multer - Upload de fichiers
- Joi - Validation des données
- CORS - Gestion CORS
- Dotenv - Variables d'environnement
