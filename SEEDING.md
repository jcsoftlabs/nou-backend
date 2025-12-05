# Guide de Seeding de la Base de Données

Ce document explique comment utiliser les scripts de seeding pour peupler la base de données avec des données de test.

## Scripts Disponibles

### 1. Initialisation de la Base de Données
```bash
npm run db:init
```
Ce script:
- Crée la base de données si elle n'existe pas
- Synchronise tous les modèles Sequelize avec la base de données
- Met à jour la structure des tables existantes

### 2. Seeding de la Base de Données
```bash
npm run db:seed
```
Ce script:
- Nettoie toutes les données existantes
- Insère des données de test complètes
- Crée des utilisateurs de test avec des mots de passe

## Données Créées

Le script de seeding crée les données suivantes:

### Configuration des Points (4 entrées)
- `referral_base`: 10 points pour parrainer un nouveau membre
- `referral_payment`: 5 points quand le filleul paie
- `quiz_completion`: 20 points pour compléter un quiz
- `podcast_listen`: 3 points pour écouter un podcast

### Membres (5 utilisateurs)
1. **Admin** - Compte administrateur
   - Username: `admin`
   - Password: `password123`
   - Email: `admin@nou.ht`
   - Rôle: `admin`

2. **Jean Dupont** - Membre actif
   - Username: `jdupont`
   - Password: `password123`
   - Email: `jean.dupont@example.ht`
   - Rôle: `membre`
   - A 2 filleuls (Marie et Paul)
   - A effectué 2 paiements validés

3. **Marie Pierre** - Membre
   - Username: `mpierre`
   - Password: `password123`
   - Email: `marie.pierre@example.ht`
   - Rôle: `membre`
   - Parrainée par Jean

4. **Paul Joseph** - Membre
   - Username: `pjoseph`
   - Password: `password123`
   - Email: `paul.joseph@example.ht`
   - Rôle: `membre`
   - Parrainé par Jean
   - A un paiement en attente

5. **Sophie Charles** - Nouveau membre
   - Username: `scharles`
   - Password: `password123`
   - Email: `sophie.charles@example.ht`
   - Rôle: `membre`
   - Pas de parrain
   - A un paiement en attente

### Referrals (3 parrainages)
- Admin → Jean (10 points)
- Jean → Marie (15 points)
- Jean → Paul (15 points)

### Cotisations (5 paiements)
- 2 paiements validés pour Jean (1000 HTG total)
- 1 paiement validé pour Marie (500 HTG)
- 1 paiement en attente pour Paul (500 HTG)
- 1 paiement en attente pour Sophie (250 HTG)

### Podcasts (4 épisodes)
1. "Bienvenue sur NOU - Épisode 1" (150 écoutes)
2. "Les défis de notre génération" (98 écoutes)
3. "Live - Session Q&A" (en direct, 45 écoutes)
4. "L'importance de l'engagement civique" (72 écoutes)

### Quiz (3 quiz avec 7 questions)
1. **Histoire d'Haïti - Niveau 1** (3 questions)
   - Date d'indépendance
   - Premier empereur
   - Bataille de Vertières

2. **Constitution haïtienne** (2 questions)
   - Année d'adoption (1987)
   - Nombre de départements

3. **Culture et traditions** (2 questions)
   - Langues officielles
   - Plat national

### Résultats de Quiz (4 participations)
- Jean: 15 points (Histoire) + 10 points (Constitution)
- Marie: 10 points (Histoire)
- Paul: 5 points (Histoire)

### Tokens FCM (3 tokens)
- Jean: Token Android
- Marie: Token iOS
- Paul: Token Android

### Logs d'Audit (4 entrées)
- Connexion Admin
- Validation de paiement par Admin
- Connexion Jean
- Complétion quiz par Jean

## Utilisation Recommandée

### Première Installation
```bash
# 1. Installer les dépendances
npm install

# 2. Configurer le fichier .env
cp .env.sample .env
# Éditer .env avec vos paramètres

# 3. Initialiser la base de données
npm run db:init

# 4. Peupler avec des données de test
npm run db:seed
```

### Réinitialisation Complète
```bash
# Nettoie et recrée toutes les données
npm run db:seed
```

### Tests d'API
Après le seeding, vous pouvez tester l'API avec:

```bash
# Test de connexion admin (avec username)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin", "password": "password123"}'

# Test de connexion membre (avec username)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "jdupont", "password": "password123"}'

# Test de connexion avec email
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "jean.dupont@example.ht", "password": "password123"}'

# Test de connexion avec téléphone
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "+50937111111", "password": "password123"}'
```

**Note:** Le champ `identifier` accepte:
- Username (ex: `jdupont`)
- Email (ex: `jean.dupont@example.ht`)
- Téléphone (ex: `+50937111111`)

## Avertissements

⚠️ **ATTENTION**: Le script `db:seed` supprime TOUTES les données existantes avant d'insérer les nouvelles données.

⚠️ **Ne PAS utiliser en production**: Ces scripts sont destinés uniquement au développement et aux tests.

## Structure des Fichiers

```
src/
├── scripts/
│   ├── initDb.js     # Initialisation de la DB
│   └── seedDb.js     # Seeding des données
└── models/           # Modèles Sequelize
```

## Personnalisation

Pour modifier les données de test, éditez le fichier:
```
src/scripts/seedDb.js
```

Vous pouvez:
- Ajouter plus de membres
- Créer des quiz supplémentaires
- Modifier les montants des cotisations
- Ajouter des podcasts
- Personnaliser les configurations de points

## Résolution de Problèmes

### Erreur: Base de données n'existe pas
```bash
npm run db:init
```

### Erreur: Clé étrangère
Assurez-vous d'exécuter `db:init` avant `db:seed`:
```bash
npm run db:init && npm run db:seed
```

### Erreur: Colonne manquante
La structure de la DB est désynchronisée. Réinitialisez:
```bash
npm run db:init
npm run db:seed
```

## Support

Pour toute question ou problème:
1. Vérifiez que votre fichier `.env` est correctement configuré
2. Assurez-vous que MySQL est en cours d'exécution
3. Vérifiez les logs pour plus de détails
