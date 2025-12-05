# Documentation API - Système de Dons

## Vue d'ensemble
Le système de dons permet aux membres d'effectuer des dons à l'organisation. Chaque don doit être vérifié et approuvé par un administrateur.

---

## Endpoints Membres

### POST /dons
Créer un nouveau don.

**Accès:** Privé (Membre authentifié)

**Headers requis:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Corps de la requête (multipart/form-data):**
- `montant` (number, requis) - Montant du don
- `description` (string, optionnel) - Description ou message du donateur
- `recu` (file, optionnel) - Image ou PDF du reçu de paiement (JPG, PNG, PDF max 5MB)

**Exemple avec curl:**
```bash
curl -X POST http://localhost:4000/dons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "montant=500" \
  -F "description=Don pour soutenir l'organisation" \
  -F "recu=@/path/to/receipt.jpg"
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Don enregistré avec succès. En attente de vérification.",
  "data": {
    "id": 1,
    "membre_id": 123,
    "montant": "500.00",
    "recu_url": "/uploads/dons/recu-1234567890-123456789.jpg",
    "statut_don": "en_attente",
    "description": "Don pour soutenir l'organisation",
    "date_don": "2025-11-25T23:30:00.000Z"
  }
}
```

---

### GET /dons/mes-dons
Obtenir tous les dons du membre connecté.

**Accès:** Privé (Membre authentifié)

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Dons récupérés avec succès",
  "data": [
    {
      "id": 1,
      "membre_id": 123,
      "montant": "500.00",
      "recu_url": "/uploads/dons/recu-1234567890-123456789.jpg",
      "statut_don": "approuve",
      "date_don": "2025-11-25T23:30:00.000Z",
      "date_verification": "2025-11-25T23:45:00.000Z",
      "description": "Don pour soutenir l'organisation",
      "commentaire_verification": "Don approuvé - Merci pour votre générosité",
      "admin_verificateur": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Admin"
      }
    }
  ]
}
```

---

### GET /dons/:id
Obtenir les détails d'un don spécifique.

**Accès:** Privé (Membre authentifié - uniquement ses propres dons)

**Headers requis:**
```
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Don récupéré avec succès",
  "data": {
    "id": 1,
    "membre_id": 123,
    "montant": "500.00",
    "recu_url": "/uploads/dons/recu-1234567890-123456789.jpg",
    "statut_don": "en_attente",
    "date_don": "2025-11-25T23:30:00.000Z",
    "description": "Don pour soutenir l'organisation"
  }
}
```

---

## Endpoints Admin

### GET /admin/dons
Obtenir la liste de tous les dons avec filtres.

**Accès:** Privé (Admin uniquement)

**Headers requis:**
```
Authorization: Bearer <admin_token>
```

**Paramètres de requête:**
- `page` (number, optionnel) - Numéro de page (défaut: 1)
- `limit` (number, optionnel) - Nombre d'éléments par page (défaut: 50)
- `statut` (string, optionnel) - Filtrer par statut: `en_attente`, `approuve`, `rejete`
- `membre_id` (number, optionnel) - Filtrer par membre

**Exemple:**
```
GET /admin/dons?page=1&limit=20&statut=en_attente
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Dons récupérés avec succès",
  "data": {
    "data": [
      {
        "id": 1,
        "membre_id": 123,
        "montant": "500.00",
        "recu_url": "/uploads/dons/recu-1234567890-123456789.jpg",
        "statut_don": "en_attente",
        "date_don": "2025-11-25T23:30:00.000Z",
        "description": "Don pour soutenir l'organisation",
        "membre": {
          "id": 123,
          "nom": "Martin",
          "prenom": "Sophie",
          "email": "sophie@example.com",
          "telephone_principal": "+509 1234 5678"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

### PUT /admin/dons/:id/approuver
Approuver un don.

**Accès:** Privé (Admin uniquement)

**Headers requis:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Corps de la requête:**
```json
{
  "commentaire": "Don approuvé - Merci pour votre générosité"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Don approuvé avec succès",
  "data": {
    "id": 1,
    "membre_id": 123,
    "montant": "500.00",
    "recu_url": "/uploads/dons/recu-1234567890-123456789.jpg",
    "statut_don": "approuve",
    "date_don": "2025-11-25T23:30:00.000Z",
    "date_verification": "2025-11-25T23:45:00.000Z",
    "commentaire_verification": "Don approuvé - Merci pour votre générosité",
    "admin_verificateur_id": 1,
    "membre": {
      "id": 123,
      "nom": "Martin",
      "prenom": "Sophie",
      "email": "sophie@example.com"
    },
    "admin_verificateur": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Admin"
    }
  }
}
```

---

### PUT /admin/dons/:id/rejeter
Rejeter un don.

**Accès:** Privé (Admin uniquement)

**Headers requis:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Corps de la requête:**
```json
{
  "commentaire": "Reçu invalide - veuillez soumettre un reçu valide"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Don rejeté",
  "data": {
    "id": 1,
    "membre_id": 123,
    "montant": "500.00",
    "recu_url": "/uploads/dons/recu-1234567890-123456789.jpg",
    "statut_don": "rejete",
    "date_don": "2025-11-25T23:30:00.000Z",
    "date_verification": "2025-11-25T23:45:00.000Z",
    "commentaire_verification": "Reçu invalide - veuillez soumettre un reçu valide",
    "admin_verificateur_id": 1,
    "membre": {
      "id": 123,
      "nom": "Martin",
      "prenom": "Sophie",
      "email": "sophie@example.com"
    },
    "admin_verificateur": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Admin"
    }
  }
}
```

---

## Statuts des dons

- **`en_attente`** - Don soumis, en attente de vérification par un admin
- **`approuve`** - Don vérifié et approuvé par un admin
- **`rejete`** - Don rejeté par un admin (reçu invalide, montant incorrect, etc.)

---

## Fichiers acceptés pour les reçus

- **Formats:** JPG, JPEG, PNG, PDF
- **Taille maximale:** 5 MB
- **Stockage:** `/uploads/dons/`

---

## Structure de la base de données

```sql
CREATE TABLE dons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  membre_id INT NOT NULL,
  montant DECIMAL(10, 2) NOT NULL,
  recu_url VARCHAR(255),
  statut_don ENUM('en_attente', 'approuve', 'rejete') DEFAULT 'en_attente',
  date_don TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_verification TIMESTAMP NULL,
  admin_verificateur_id INT,
  commentaire_verification TEXT,
  description TEXT,
  
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_verificateur_id) REFERENCES membres(id) ON DELETE SET NULL,
  INDEX idx_membre_id (membre_id),
  INDEX idx_statut_don (statut_don),
  INDEX idx_date_don (date_don)
);
```
