# Déploiement Railway - Backend NOU

## ✅ Statut du Déploiement

La base de données MySQL sur Railway a été déployée avec succès avec toutes les migrations et données de test.

### Informations de Connexion

- **Host**: mainline.proxy.rlwy.net
- **Port**: 18580
- **User**: root
- **Database**: railway

### URL de Connexion
```
mysql://root:VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz@mainline.proxy.rlwy.net:18580/railway
```

## 📊 Base de Données

### Tables Créées

- ✅ `membres` - Table des membres avec statuts
- ✅ `cotisations` - Gestion des cotisations
- ✅ `referrals` - Système de parrainage
- ✅ `formations` - Formations disponibles
- ✅ `modules` - Modules de formation
- ✅ `quiz` - Quiz liés aux modules
- ✅ `quiz_questions` - Questions des quiz
- ✅ `quiz_resultats` - Résultats des quiz
- ✅ `podcasts` - Contenus audio/vidéo
- ✅ `dons` - Système de dons
- ✅ `config_points` - Configuration du système de points
- ✅ `fcm_tokens` - Tokens pour les notifications push
- ✅ `audit_logs` - Logs d'audit système

### Données de Test Insérées

#### Membres
- **Admin** (username: `admin`, password: `password123`)
  - Rôle: admin
  - Statut: Dirigeant national
  
- **Jean Dupont** (username: `jdupont`, password: `password123`)
  - Rôle: membre
  - Statut: Membre pré-adhérent
  - Email: jean.dupont@example.ht
  
- **Marie Pierre** (username: `mpierre`, password: `password123`)
  - Rôle: membre
  - Statut: Membre pré-adhérent
  - Email: marie.pierre@example.ht

#### Autres Données
- 4 configurations de points (referral_base, referral_payment, quiz_completion, podcast_listen)
- 2 relations de parrainage
- 1 cotisation validée
- 1 formation avec 1 module
- 1 quiz avec questions
- 1 podcast

## 🚀 Déploiement du Serveur Backend

### Variables d'Environnement Railway

Configurez les variables d'environnement suivantes dans Railway :

```env
# Server
PORT=4000
NODE_ENV=production

# Database
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=18580
DB_USER=root
DB_PASS=VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz
DB_NAME=railway

# JWT
JWT_SECRET=nou_railway_jwt_secret_key_2024_secure

# Referral
REFERRAL_BASE_POINTS=10
REFERRAL_PAYMENT_BONUS=5
```

### Commandes de Déploiement

1. **Initialiser un nouveau projet Railway** (si pas déjà fait)
   ```bash
   railway init
   ```

2. **Lier au projet existant**
   ```bash
   railway link
   ```

3. **Déployer**
   ```bash
   railway up
   ```

4. **Voir les logs**
   ```bash
   railway logs
   ```

## 📝 Scripts Disponibles

### Script de Déploiement Initial
```bash
node scripts/deploy-railway-final.js
```

Ce script :
- Crée les tables manquantes (config_points, fcm_tokens, audit_logs)
- Insère les données de test
- Vérifie la connexion

## 🔧 Configuration du Projet

Le fichier `railway.json` est configuré pour :
- Utiliser Nixpacks comme builder
- Démarrer avec `node src/server.js`
- Redémarrer automatiquement en cas d'échec (max 10 tentatives)

## 🧪 Tester la Connexion

### Depuis votre machine locale

```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'mainline.proxy.rlwy.net',
  port: 18580,
  user: 'root',
  password: 'VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz',
  database: 'railway'
});

const [rows] = await connection.query('SELECT COUNT(*) as count FROM membres');
console.log('Nombre de membres:', rows[0].count);

await connection.end();
```

## 🔐 Sécurité

⚠️ **IMPORTANT** : Les identifiants dans ce document sont pour le développement/test.
- Changez le JWT_SECRET en production
- Utilisez des secrets Railway pour les informations sensibles
- N'exposez jamais les identifiants de base de données dans le code source

## 📱 Endpoints API

Une fois déployé, votre API sera disponible à :
```
https://[votre-projet].railway.app
```

### Endpoints principaux

- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /membres` - Liste des membres (authentifié)
- `POST /cotisations` - Créer une cotisation
- `GET /formations` - Liste des formations
- `GET /quiz/:id` - Détails d'un quiz
- `GET /podcasts` - Liste des podcasts

## 🐛 Dépannage

### La connexion timeout
- Vérifiez que vous utilisez les bons identifiants
- Railway peut avoir des restrictions réseau temporaires
- Augmentez le `connectTimeout` dans la configuration Sequelize

### Tables manquantes
- Exécutez le script `deploy-railway-final.js` qui crée automatiquement les tables manquantes

### Données dupliquées
- Le script utilise `INSERT IGNORE` pour config_points
- Pour réinitialiser : supprimez les données manuellement via Railway Dashboard

## 📞 Support

Pour toute question sur le déploiement, consultez la documentation Railway : https://docs.railway.app/
