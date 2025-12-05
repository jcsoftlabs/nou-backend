# Modifications Backend - Support Username et Code d'adhésion

## 📋 Résumé des modifications

Le backend a été modifié pour supporter :
1. ✅ **Username** - Identifiant unique pour l'authentification
2. ✅ **Code d'adhésion** - Validation du code de parrainage à l'inscription
3. ✅ **Login flexible** - Connexion avec username, email OU téléphone

## 🔧 Fichiers modifiés

### 1. Validators (`src/validators/authValidators.js`)

**Modifications apportées** :
- ✅ Ajout de `username` au `registerSchema` (requis, 3-50 caractères, pattern)
- ✅ Ajout de `code_adhesion` au `registerSchema` (requis)
- ✅ Mise à jour du `loginSchema` pour accepter username

**Validation username** :
```javascript
username: Joi.string()
  .min(3)
  .max(50)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .required()
```

**Validation code_adhesion** :
```javascript
code_adhesion: Joi.string().required()
```

### 2. Service d'authentification (`src/services/authService.js`)

**Fonction `register`** :
- ✅ Vérifie l'unicité du username
- ✅ Valide que le `code_adhesion` existe (parrain valide)
- ✅ Stocke `code_parrain` pour la logique de referral
- ✅ Génère un nouveau `code_adhesion` unique pour le nouveau membre
- ✅ Retourne le username dans la réponse

**Fonction `login`** :
- ✅ Accepte username, email OU téléphone comme identifiant
- ✅ Logique de détection intelligente :
  - Si contient `@` → Email
  - Si alphanumérique → Essayer username puis téléphone
  - Sinon → Téléphone
- ✅ Retourne le username dans la réponse

**Logique de parrainage** :
```javascript
// Vérifier si le code_adhesion (code du parrain) existe
if (data.code_adhesion) {
  const parrain = await Membre.findOne({ 
    where: { code_adhesion: data.code_adhesion } 
  });
  
  if (!parrain) {
    throw new Error('Code de référence invalide');
  }
  
  data.code_parrain = data.code_adhesion;
}
```

### 3. Modèle Membre (`src/models/Membre.js`)

**Ajout du champ** :
```javascript
username: {
  type: DataTypes.STRING(50),
  unique: true,
  allowNull: false
}
```

**Index ajouté** :
```javascript
indexes: [
  { fields: ['username'] },
  // ... autres index
]
```

### 4. Migration SQL (`src/migrations/003_add_username_column.sql`)

**Commandes SQL** :
```sql
-- Ajouter la colonne username
ALTER TABLE membres 
ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL AFTER id;

-- Ajouter un index
ALTER TABLE membres 
ADD INDEX idx_username (username);

-- Commenter la table
ALTER TABLE membres 
COMMENT = 'Table des membres avec authentification par username, email ou téléphone';
```

### 5. Script de migration (`src/migrations/run_003_migration.js`)

**Utilisation** :
```bash
node src/migrations/run_003_migration.js
```

**Fonctionnalités** :
- Lit le fichier SQL de migration
- Exécute les commandes une par une
- Gère les erreurs (colonne déjà existante, etc.)
- Affiche un résumé des modifications

## 🚀 Exécution de la migration

### Méthode 1 : Script Node.js (Recommandé)

```bash
cd /Users/christopherjerome/nou-backend
node src/migrations/run_003_migration.js
```

### Méthode 2 : Directement avec MySQL

```bash
mysql -u root -p nou_db < src/migrations/003_add_username_column.sql
```

### Méthode 3 : Via phpMyAdmin (XAMPP)

1. Ouvrir phpMyAdmin
2. Sélectionner la base `nou_db`
3. Onglet SQL
4. Copier le contenu de `003_add_username_column.sql`
5. Exécuter

## 📊 Structure de la table membres (mise à jour)

```sql
CREATE TABLE membres (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,        -- ✨ NOUVEAU
  code_adhesion VARCHAR(50) UNIQUE,            -- Existant
  code_parrain VARCHAR(50),                    -- Existant
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone_principal VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  ...
  -- Tous les autres champs existants
);
```

## 🔐 Flux d'inscription modifié

### Avant
```json
{
  "nom": "Doe",
  "prenom": "John",
  "telephone_principal": "+509...",
  "password": "Pass123",
  "email": "john@example.com"
}
```

### Après (maintenant)
```json
{
  "username": "john_doe",                    // ✨ NOUVEAU (requis)
  "code_adhesion": "REF-12345",             // ✨ NOUVEAU (requis, validé)
  "password": "Pass123",
  "nom": "Doe",
  "prenom": "John",
  "telephone_principal": "+509...",
  "email": "john@example.com"
}
```

## 🔑 Flux de connexion modifié

### Avant
```json
{
  "identifier": "john@example.com",  // Email OU téléphone
  "password": "Pass123"
}
```

### Après (maintenant)
```json
{
  "identifier": "john_doe",          // Username, Email OU téléphone ✨
  "password": "Pass123"
}
```

**Exemples valides** :
- `{ "identifier": "john_doe", "password": "..." }`       → Username
- `{ "identifier": "john@example.com", "password": "..." }` → Email
- `{ "identifier": "+50912345678", "password": "..." }`    → Téléphone

## 🎯 Logique de validation du code de parrainage

**À l'inscription** :
1. Utilisateur fournit un `code_adhesion` (code du parrain)
2. Backend vérifie que ce code existe dans la table `membres`
3. Si invalide → Erreur "Code de référence invalide"
4. Si valide → Inscription continue
5. Un **nouveau** `code_adhesion` unique est généré pour le nouveau membre
6. Le lien parrain-filleul est créé via `referralService`

**Exemple** :
```javascript
// Alice s'inscrit avec le code de Bob
POST /auth/register
{
  "username": "alice",
  "code_adhesion": "NOU202511150001",  // Code de Bob
  "password": "AlicePass123",
  ...
}

// Backend vérifie que NOU202511150001 existe
// Si oui → Créer Alice avec un nouveau code (ex: NOU202511160002)
// Créer le lien: Bob (parrain) → Alice (filleule)
```

## 📝 Réponses API mises à jour

### POST /auth/register

**Succès (201)** :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "id": 123,
    "username": "john_doe",              // ✨ Ajouté
    "code_adhesion": "NOU202511160002",  // Nouveau code généré
    "nom": "Doe",
    "prenom": "John",
    "email": "john@example.com",
    "telephone_principal": "+509..."
  }
}
```

**Erreurs possibles** :
- `"Ce nom d'utilisateur est déjà utilisé"`
- `"Code de référence invalide"`
- `"Cet email est déjà utilisé"`
- `"Ce numéro de téléphone est déjà utilisé"`

### POST /auth/login

**Succès (200)** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "membre": {
      "id": 123,
      "username": "john_doe",            // ✨ Ajouté
      "code_adhesion": "NOU202511160002",
      "nom": "Doe",
      "prenom": "John",
      "email": "john@example.com",
      "telephone_principal": "+509...",
      "role": "membre"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## ⚠️ Points d'attention

### 1. Membres existants

Si des membres existent déjà dans la base, ils n'ont **PAS de username**.

**Solution temporaire** : Mettre la migration en commentaire et remplir manuellement :

```sql
-- Si la migration échoue à cause de membres existants sans username
ALTER TABLE membres 
ADD COLUMN username VARCHAR(50) UNIQUE AFTER id;  -- Sans NOT NULL

-- Puis attribuer des usernames
UPDATE membres SET username = CONCAT('user_', id) WHERE username IS NULL;

-- Ensuite rendre NOT NULL
ALTER TABLE membres 
MODIFY COLUMN username VARCHAR(50) UNIQUE NOT NULL;
```

### 2. Code parrain vs Code adhesion

**Attention à la différence** :
- `code_adhesion` reçu à l'inscription = Code du **PARRAIN** (validé)
- `code_adhesion` dans la réponse = Code **GÉNÉRÉ** pour le nouveau membre (unique)

### 3. Compatibilité avec le frontend

Le frontend Flutter envoie maintenant :
- ✅ `username` (de l'étape 1)
- ✅ `code_adhesion` (de l'étape 1, appelé "code de référence")
- ✅ `password` (de l'étape 1)
- ✅ Tous les autres champs (de l'étape 2)

**Tout est maintenant compatible !** 🎉

## 🧪 Tests

### Test d'inscription

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123",
    "code_adhesion": "NOU202511150001",
    "nom": "Test",
    "prenom": "User",
    "telephone_principal": "+50912345678",
    "email": "test@example.com"
  }'
```

### Test de connexion avec username

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "TestPass123"
  }'
```

### Test de connexion avec email

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "TestPass123"
  }'
```

## ✅ Checklist de déploiement

- [ ] Exécuter la migration SQL (`run_003_migration.js`)
- [ ] Vérifier que la colonne `username` existe
- [ ] Vérifier l'index sur `username`
- [ ] Tester l'inscription avec username + code_adhesion
- [ ] Tester la connexion avec username
- [ ] Tester la connexion avec email
- [ ] Tester la connexion avec téléphone
- [ ] Vérifier la validation du code de parrainage
- [ ] Vérifier la création du lien parrain-filleul

## 🎉 Résultat final

Le backend supporte maintenant **3 modes d'authentification** :
1. 👤 **Username** (nouveau)
2. 📧 **Email**
3. 📱 **Téléphone**

Et valide le **code de parrainage** à l'inscription pour créer automatiquement le lien parrain-filleul ! 🔗
