# Documentation API NOU Backend

Base URL: `http://localhost:4000`

## Table des matières
- [Authentification](#authentification)
- [Gestion des membres (Admin)](#gestion-des-membres-admin)
- [Gestion des cotisations](#gestion-des-cotisations)
- [Webhooks MonCash](#webhooks-moncash)
- [Système de Parrainage](#système-de-parrainage)

---

## Authentification

### POST /auth/register
Inscription d'un nouveau membre.

**Accès:** Public

**Corps de la requête:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone_principal": "+509 1234 5678",
  "password": "motdepasse123",
  "email": "jean.dupont@example.com",
  "sexe": "Masculin",
  "date_de_naissance": "1990-05-15",
  // ... autres champs optionnels
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "id": 1,
    "code_adhesion": "NOU12345678901",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone_principal": "+509 1234 5678"
  }
}
```

---

### POST /auth/login
Connexion d'un membre (par email ou téléphone).

**Accès:** Public

**Corps de la requête:**
```json
{
  "identifier": "jean.dupont@example.com",
  "password": "motdepasse123"
}
```

Ou avec le téléphone:
```json
{
  "identifier": "+509 1234 5678",
  "password": "motdepasse123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "code_adhesion": "NOU12345678901",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com",
      "telephone_principal": "+509 1234 5678",
      "role": "membre"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /auth/send-otp
Envoyer un code OTP par SMS pour vérification.

**Accès:** Public

**Corps de la requête:**
```json
{
  "telephone": "+509 1234 5678"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "OTP envoyé avec succès",
  "data": {
    "success": true,
    "message": "OTP envoyé (simulation)",
    "otp": "123456"
  }
}
```

*Note: En mode développement, l'OTP est retourné dans la réponse. En production, il sera uniquement envoyé par SMS.*

---

### POST /auth/verify-otp
Vérifier un code OTP.

**Accès:** Public

**Corps de la requête:**
```json
{
  "telephone": "+509 1234 5678",
  "otp": "123456"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "OTP vérifié avec succès",
  "data": {
    "success": true,
    "message": "OTP vérifié avec succès"
  }
}
```

---

## Gestion des membres (Admin)

### POST /membres
Créer ou modifier un membre manuellement (réservé aux administrateurs).

**Accès:** Privé (Admin uniquement)

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Corps de la requête (Création):**
```json
{
  "nom": "Martin",
  "prenom": "Sophie",
  "telephone_principal": "+509 9876 5432",
  "password": "password456",
  "email": "sophie.martin@example.com",
  "role_utilisateur": "membre",
  "code_parrain": "NOU12345678901",
  "sexe": "Féminin",
  "date_de_naissance": "1985-03-20",
  "departement": "Ouest",
  "commune": "Port-au-Prince",
  "profession": "Enseignante",
  // ... tous les autres champs optionnels
}
```

**Corps de la requête (Modification):**
```json
{
  "id": 2,
  "nom": "Martin",
  "prenom": "Sophie",
  "telephone_principal": "+509 9876 5432",
  "email": "sophie.martin@example.com",
  "role_utilisateur": "partner",
  "profession": "Directrice"
  // ... autres champs à modifier
}
```

**Réponse (201 pour création, 200 pour modification):**
```json
{
  "success": true,
  "message": "Membre créé avec succès",
  "data": {
    "id": 2,
    "code_adhesion": "NOU12345678902",
    "nom": "Martin",
    "prenom": "Sophie",
    "telephone_principal": "+509 9876 5432",
    "email": "sophie.martin@example.com",
    "role_utilisateur": "membre",
    "code_parrain": "NOU12345678901",
    // ... tous les autres champs
  }
}
```

**Champs disponibles:**
- Obligatoires: `nom`, `prenom`, `telephone_principal`, `password` (pour création)
- Spécifiques admin: `role_utilisateur`, `code_parrain`, `code_adhesion`
- Optionnels: tous les champs du modèle Membre

**Rôles disponibles:**
- `membre` (par défaut)
- `admin`
- `partner`

**Audit Logging:**
Toutes les actions de création/modification sont automatiquement loguées dans la table `audit_logs` avec:
- ID de l'admin qui a effectué l'action
- Type d'action (CREATE_MEMBRE ou UPDATE_MEMBRE)
- Données avant et après modification
- IP et User-Agent

---

## Codes d'erreur

### 400 - Bad Request
Erreur de validation ou données invalides.

### 401 - Unauthorized
Token manquant, invalide ou expiré.

### 403 - Forbidden
Permissions insuffisantes pour accéder à la ressource.

### 404 - Not Found
Ressource non trouvée.

### 500 - Internal Server Error
Erreur serveur.

---

## Format des erreurs

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [
    {
      "field": "nom_du_champ",
      "message": "Message d'erreur spécifique"
    }
  ]
}
```

---

## Notes de sécurité

1. **JWT Tokens:** Les access tokens expirent après 24h, les refresh tokens après 7 jours.
2. **OTP:** Les codes OTP sont valides pendant 10 minutes.
3. **Mots de passe:** Hashés avec bcryptjs (10 salt rounds).
4. **Audit:** Toutes les actions admin sont loguées avec IP et User-Agent.

---

## Gestion des cotisations

### POST /cotisations
Créer une cotisation. Peut accepter un fichier `recu` (JPG/PNG/PDF) ou une `url_recu`.

Form-data attendu (multipart si upload):
- `membre_id` (number, requis)
- `montant` (number, requis)
- `moyen_paiement` ('moncash'|'cash'|'recu_upload', requis)
- `recu` (file, optionnel si `recu_upload`)
- `url_recu` (string, optionnel)

Réponse (201): contient la cotisation créée avec `statut_paiement`.

### PUT /cotisations/:id/valider (admin)
Valide une cotisation, met à jour `statut_paiement`, `admin_verificateur_id`, `date_verification`, `commentaire_verification`.

### PUT /cotisations/:id/rejeter (admin)
Rejette une cotisation, nécessite `commentaire_verification`.

## Webhooks MonCash

### POST /payments/moncash/webhook
Callback MonCash. Valide/rejette automatiquement la cotisation selon `status`. Répond toujours 200.

---

## Système de Parrainage

### Fonctionnement Automatique

**Lors de l'inscription:**
- Si `code_parrain` fourni, crée automatiquement l'entrée dans `referrals`
- Parrain reçoit **10 points** par défaut (configurable: `REFERRAL_BASE_POINTS`)
- Audit logging automatique

**Lors du paiement:**
- Quand filleul paie cotisation (validation ou MonCash success)
- Parrain reçoit **+5 points** bonus (configurable: `REFERRAL_PAYMENT_BONUS`)
- Audit logging automatique

### GET /referrals/:parrain_id
Obtenir la liste des filleuls et points cumulés d'un parrain.

**Paramètres:**
- `parrain_id` (number) - ID du membre parrain

**Réponse (200):**
```json
{
  "success": true,
  "message": "Liste des filleuls récupérée avec succès",
  "data": {
    "parrain": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "code_adhesion": "NOU12345678901",
      "email": "jean@example.com",
      "telephone_principal": "+509 1234 5678"
    },
    "filleuls": [
      {
        "id": 5,
        "filleul": {
          "id": 2,
          "nom": "Martin",
          "prenom": "Sophie",
          "code_adhesion": "NOU12345678902",
          "email": "sophie@example.com",
          "telephone_principal": "+509 9876 5432",
          "date_creation": "2025-11-15T10:00:00.000Z"
        },
        "points_attribues": 15,
        "date_creation": "2025-11-15T10:00:00.000Z"
      }
    ],
    "statistiques": {
      "nombre_filleuls": 1,
      "points_total": 15,
      "points_base_par_filleul": 10,
      "points_bonus_par_paiement": 5
    }
  }
}
```

### PUT /referrals/:id/adjust-points (admin)
Ajuster manuellement les points d'un referral.

**Headers:** `Authorization: Bearer <token>`

**Paramètres:**
- `id` (number) - ID du referral

**Corps:**
```json
{
  "points": 25,
  "raison": "Bonus exceptionnel pour performance"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Points ajustés avec succès",
  "data": {
    "id": 5,
    "parrain_id": 1,
    "filleul_id": 2,
    "points_attribues": 25,
    "date_creation": "2025-11-15T10:00:00.000Z"
  }
}
```

### Configuration

Dans `.env`:
```env
REFERRAL_BASE_POINTS=10        # Points à l'inscription
REFERRAL_PAYMENT_BONUS=5       # Bonus au paiement
```
