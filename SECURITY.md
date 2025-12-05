# Guide de Sécurité - NOU Backend

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans le backend NOU.

---

## 🔐 Authentification et Autorisation

### JWT (JSON Web Tokens)
- **Access Token:** Expire après 24 heures
- **Refresh Token:** Expire après 7 jours
- **Secret:** Stocké dans variable d'environnement `JWT_SECRET`
- **Algorithme:** HS256 (HMAC avec SHA-256)

### Middleware d'Authentification
- **Fichier:** `src/middleware/auth.js`
- **Usage:** Vérifie le token JWT dans l'header `Authorization: Bearer <token>`
- **Exclusion:** Exclut automatiquement le `password_hash` des réponses

### Contrôle d'Accès Basé sur les Rôles (RBAC)
- **Fichier:** `src/middleware/checkRole.js`
- **Rôles disponibles:**
  - `membre` - Utilisateur standard
  - `admin` - Administrateur avec accès complet
  - `partner` - Partenaire avec accès limité
- **Usage:** `checkRole(['admin'])` ou `checkRole(['admin', 'partner'])`

---

## 🛡️ Rate Limiting

### Configuration Générale
- **Package:** `express-rate-limit`
- **Fichier:** `src/middleware/rateLimiter.js`

### Limiteurs Implémentés

#### 1. Payment Limiter (Endpoints de Paiement)
- **Routes:** POST `/cotisations`
- **Limite:** 10 requêtes / 15 minutes
- **Clé:** IP ou User ID (si authentifié)
- **Message:** "Trop de tentatives de paiement. Veuillez réessayer dans 15 minutes."

#### 2. Admin Validation Limiter
- **Routes:** PUT `/cotisations/:id/valider`, PUT `/cotisations/:id/rejeter`
- **Limite:** 30 requêtes / 10 minutes
- **Clé:** User ID ou IP
- **Message:** "Trop de validations. Veuillez ralentir."

#### 3. General Limiter
- **Routes:** Routes publiques (à appliquer selon besoin)
- **Limite:** 100 requêtes / 15 minutes
- **Message:** "Trop de requêtes. Veuillez réessayer plus tard."

### Headers de Rate Limit
```
RateLimit-Limit: 10
RateLimit-Remaining: 9
RateLimit-Reset: 1699999999
```

---

## 📁 Upload de Fichiers

### Configuration Multer
- **Fichier:** `src/config/multer.js`
- **Dossier de stockage:** `src/uploads/receipts/`

### Validations

#### Types de fichiers autorisés
- **Extensions:** `.jpg`, `.jpeg`, `.png`, `.pdf`
- **MIME types:** `image/jpeg`, `image/png`, `application/pdf`
- **Validation:** Extension ET MIME type (double vérification)

#### Taille maximale
- **Limite:** 5 MB par fichier
- **Erreur si dépassé:** "File too large"

#### Sanitisation des noms
- **Format:** `receipt_{membre_id}_{timestamp}_{sanitized_name}.ext`
- **Caractères autorisés:** a-z, A-Z, 0-9, underscore
- **Caractères remplacés:** Tous les autres → `_`

### Gestion des Erreurs d'Upload
```javascript
// Erreur si type non autorisé
cb(new Error('Seuls les fichiers JPG, PNG et PDF sont autorisés'))

// Erreur si taille dépassée
// Géré automatiquement par Multer
```

---

## 📊 Audit Logging

### Table `audit_logs`
Toutes les actions sensibles sont enregistrées avec :

#### Informations Stockées
- `user_id` - ID de l'utilisateur qui effectue l'action
- `action` - Type d'action (CREATE_COTISATION, VALIDATE_COTISATION, etc.)
- `entity_type` - Type d'entité (cotisation, membre, etc.)
- `entity_id` - ID de l'entité modifiée
- `description` - Description lisible de l'action
- `data_before` - État avant modification (JSON)
- `data_after` - État après modification (JSON)
- `ip_address` - Adresse IP de l'utilisateur
- `user_agent` - User-Agent du navigateur
- `created_at` - Timestamp de l'action

#### Actions Loguées

**Cotisations:**
- `CREATE_COTISATION` - Création d'une cotisation
- `VALIDATE_COTISATION` - Validation par admin
- `REJECT_COTISATION` - Rejet par admin
- `MONCASH_WEBHOOK` - Callback MonCash reçu

**Membres:**
- `CREATE_MEMBRE` - Création par admin
- `UPDATE_MEMBRE` - Modification par admin

### Exemple de Log
```json
{
  "user_id": 1,
  "action": "VALIDATE_COTISATION",
  "entity_type": "cotisation",
  "entity_id": 42,
  "description": "Validation de la cotisation #42 par admin",
  "data_before": {
    "statut_paiement": "en_attente",
    "montant": 500
  },
  "data_after": {
    "statut_paiement": "valide",
    "admin_verificateur_id": 1,
    "date_verification": "2025-11-15T22:00:00.000Z",
    "commentaire_verification": "Reçu vérifié"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-11-15T22:00:00.000Z"
}
```

---

## 🔒 Mots de Passe

### Hachage
- **Algorithm:** bcrypt
- **Salt rounds:** 10
- **Package:** `bcryptjs`

### Stockage
- Les mots de passe en clair ne sont **jamais** stockés
- Seul le `password_hash` est enregistré en base de données
- Le hash est automatiquement exclu des réponses API

---

## 🌐 CORS

### Configuration
```javascript
app.use(cors());
```

**Note:** En production, configurer CORS pour autoriser uniquement les origines spécifiques :
```javascript
app.use(cors({
  origin: ['https://votre-domaine.com', 'https://app.votre-domaine.com'],
  credentials: true
}));
```

---

## 📝 Variables d'Environnement Sensibles

### Fichier `.env`
**Toujours** ajouter au `.gitignore` ✅

### Variables Critiques
```env
JWT_SECRET=votre_secret_très_long_et_aléatoire
DB_PASS=mot_de_passe_base_de_données
MONCASH_CONFIG_PLACEHOLDER=configuration_moncash
```

### Bonnes Pratiques
1. ✅ Utiliser des secrets forts (minimum 32 caractères aléatoires)
2. ✅ Ne jamais commiter `.env` dans git
3. ✅ Utiliser des secrets différents par environnement (dev/staging/prod)
4. ✅ Rotate les secrets régulièrement

---

## 🚨 Webhook MonCash

### Sécurité
- **Endpoint:** POST `/payments/moncash/webhook`
- **Accès:** Public (appelé par MonCash)
- **Validation:** Schéma Joi pour structure des données

### TODO: Vérification de Signature
```javascript
// À implémenter dans src/services/cotisationService.js ligne 178
// Vérifier la signature du webhook avec le secret MonCash
const isValidSignature = verifyMonCashSignature(webhookData, signature, secret);
if (!isValidSignature) {
  throw new Error('Signature webhook invalide');
}
```

### Protection
- ✅ Validation stricte des données entrantes
- ✅ Vérification de la correspondance des montants
- ✅ Logging de tous les webhooks reçus
- ⚠️ TODO: Vérification de signature cryptographique

---

## 📋 Checklist de Déploiement en Production

### Avant le Déploiement
- [ ] Changer `JWT_SECRET` pour une valeur aléatoire forte
- [ ] Configurer CORS avec origines spécifiques
- [ ] Activer HTTPS uniquement
- [ ] Vérifier que `.env` n'est pas dans git
- [ ] Implémenter la vérification de signature MonCash
- [ ] Configurer des secrets différents par environnement
- [ ] Activer les logs de sécurité
- [ ] Mettre en place des alertes sur les échecs d'authentification
- [ ] Configurer un WAF (Web Application Firewall) si possible
- [ ] Réviser les limites de rate limiting selon le trafic

### Surveillance Continue
- [ ] Monitorer les logs d'audit
- [ ] Surveiller les tentatives d'authentification échouées
- [ ] Vérifier les uploads de fichiers suspects
- [ ] Analyser les patterns de trafic anormaux

---

## 📞 Reporting de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez **ne pas** créer d'issue publique.
Contactez directement l'équipe de sécurité.

---

## 🔄 Mises à Jour

Ce document doit être mis à jour à chaque nouvelle fonctionnalité de sécurité implémentée.

**Dernière mise à jour:** 2025-11-15
