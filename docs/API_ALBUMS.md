# API Médiathèque - Documentation

Cette API permet de gérer les albums photo d'événements organisés par le parti.

## Base URL
- Production: `https://nou-backend.railway.app`
- Local: `http://localhost:4000`

---

## Routes Publiques

### 1. Obtenir tous les albums
**GET** `/albums`

Récupère la liste des albums avec pagination et filtres.

#### Query Parameters
| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `page` | number | Numéro de page | 1 |
| `limit` | number | Nombre d'albums par page | 10 |
| `est_public` | boolean | Filtrer par visibilité (true/false) | tous |
| `annee` | number | Filtrer par année de l'événement | tous |
| `include_photos` | boolean | Inclure les photos dans la réponse | false |

#### Exemple de requête
```bash
GET /albums?page=1&limit=10&est_public=true&include_photos=true
```

#### Réponse Succès (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titre": "Congrès National 2024",
      "description": "Photos du congrès national...",
      "date_evenement": "2024-03-15",
      "lieu_evenement": "Port-au-Prince",
      "image_couverture": "/uploads/albums/album_123456_cover.jpg",
      "est_public": true,
      "ordre": 10,
      "auteur_id": 5,
      "created_at": "2024-03-20T10:00:00.000Z",
      "updated_at": "2024-03-20T10:00:00.000Z",
      "auteur": {
        "id": 5,
        "nom": "Dupont",
        "prenom": "Jean"
      },
      "photos": [
        {
          "id": 1,
          "url_photo": "/uploads/albums/album_123457_photo1.jpg",
          "legende": "Ouverture du congrès",
          "ordre": 0,
          "created_at": "2024-03-20T10:05:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### 2. Obtenir un album par ID
**GET** `/albums/:id`

Récupère un album spécifique avec toutes ses photos.

#### Paramètres URL
- `id`: ID de l'album

#### Exemple de requête
```bash
GET /albums/1
```

#### Réponse Succès (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titre": "Congrès National 2024",
    "description": "Photos du congrès national...",
    "date_evenement": "2024-03-15",
    "lieu_evenement": "Port-au-Prince",
    "image_couverture": "/uploads/albums/album_123456_cover.jpg",
    "est_public": true,
    "ordre": 10,
    "auteur_id": 5,
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T10:00:00.000Z",
    "auteur": {
      "id": 5,
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "photos": [
      {
        "id": 1,
        "url_photo": "/uploads/albums/album_123457_photo1.jpg",
        "legende": "Ouverture du congrès",
        "ordre": 0,
        "created_at": "2024-03-20T10:05:00.000Z"
      },
      {
        "id": 2,
        "url_photo": "/uploads/albums/album_123458_photo2.jpg",
        "legende": "Discours du président",
        "ordre": 1,
        "created_at": "2024-03-20T10:10:00.000Z"
      }
    ]
  }
}
```

#### Réponse Erreur (404)
```json
{
  "success": false,
  "message": "Album non trouvé"
}
```

---

## Routes Admin (Authentification requise)

**Header requis pour toutes les routes admin:**
```
Authorization: Bearer <JWT_TOKEN>
```

Le JWT token doit être obtenu via l'authentification et l'utilisateur doit avoir le rôle `admin`.

---

### 3. Créer un album
**POST** `/albums/admin`

Crée un nouvel album.

#### Body (multipart/form-data)
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `titre` | string | Oui | Titre de l'album |
| `description` | string | Non | Description de l'album |
| `date_evenement` | date | Non | Date de l'événement (YYYY-MM-DD) |
| `lieu_evenement` | string | Non | Lieu de l'événement |
| `est_public` | boolean | Non | Visibilité (défaut: true) |
| `ordre` | number | Non | Ordre d'affichage (défaut: 0) |
| `image_couverture` | file | Non | Image de couverture (max 10MB) |

#### Exemple de requête (FormData)
```javascript
const formData = new FormData();
formData.append('titre', 'Congrès National 2024');
formData.append('description', 'Photos du congrès national...');
formData.append('date_evenement', '2024-03-15');
formData.append('lieu_evenement', 'Port-au-Prince');
formData.append('est_public', 'true');
formData.append('ordre', '10');
formData.append('image_couverture', coverFile);

fetch('/albums/admin', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### Réponse Succès (201)
```json
{
  "success": true,
  "message": "Album créé avec succès",
  "data": {
    "id": 1,
    "titre": "Congrès National 2024",
    "description": "Photos du congrès national...",
    "date_evenement": "2024-03-15",
    "lieu_evenement": "Port-au-Prince",
    "image_couverture": "/uploads/albums/album_123456_cover.jpg",
    "est_public": true,
    "ordre": 10,
    "auteur_id": 5,
    "created_at": "2024-03-20T10:00:00.000Z",
    "updated_at": "2024-03-20T10:00:00.000Z"
  }
}
```

---

### 4. Mettre à jour un album
**PUT** `/albums/admin/:id`

Met à jour un album existant.

#### Paramètres URL
- `id`: ID de l'album

#### Body (multipart/form-data)
Tous les champs sont optionnels. Seuls les champs fournis seront mis à jour.

| Champ | Type | Description |
|-------|------|-------------|
| `titre` | string | Nouveau titre |
| `description` | string | Nouvelle description |
| `date_evenement` | date | Nouvelle date (YYYY-MM-DD) |
| `lieu_evenement` | string | Nouveau lieu |
| `est_public` | boolean | Nouvelle visibilité |
| `ordre` | number | Nouvel ordre |
| `image_couverture` | file | Nouvelle image de couverture |

#### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Album mis à jour avec succès",
  "data": { /* album complet avec photos */ }
}
```

---

### 5. Supprimer un album
**DELETE** `/albums/admin/:id`

Supprime un album et toutes ses photos.

#### Paramètres URL
- `id`: ID de l'album

#### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Album supprimé avec succès"
}
```

---

### 6. Ajouter des photos à un album
**POST** `/albums/admin/:id/photos`

Ajoute une ou plusieurs photos à un album.

#### Paramètres URL
- `id`: ID de l'album

#### Body (multipart/form-data)
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `photos[]` | file[] | Oui | Tableau de fichiers images (max 50, 10MB chacun) |
| `legendes` | string | Non | JSON array de légendes (optionnel) |

#### Exemple de requête
```javascript
const formData = new FormData();
formData.append('photos', photo1File);
formData.append('photos', photo2File);
formData.append('photos', photo3File);
formData.append('legendes', JSON.stringify([
  'Ouverture du congrès',
  'Discours du président',
  'Photo de groupe'
]));

fetch('/albums/admin/1/photos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### Réponse Succès (201)
```json
{
  "success": true,
  "message": "3 photo(s) ajoutée(s) avec succès",
  "data": [
    {
      "id": 1,
      "album_id": 1,
      "url_photo": "/uploads/albums/album_123457_photo1.jpg",
      "legende": "Ouverture du congrès",
      "ordre": 0,
      "created_at": "2024-03-20T10:05:00.000Z"
    }
  ]
}
```

---

### 7. Mettre à jour une photo
**PUT** `/albums/admin/photos/:photoId`

Met à jour les informations d'une photo (légende, ordre).

#### Paramètres URL
- `photoId`: ID de la photo

#### Body (application/json)
```json
{
  "legende": "Nouvelle légende",
  "ordre": 5
}
```

#### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Photo mise à jour avec succès",
  "data": {
    "id": 1,
    "album_id": 1,
    "url_photo": "/uploads/albums/album_123457_photo1.jpg",
    "legende": "Nouvelle légende",
    "ordre": 5,
    "created_at": "2024-03-20T10:05:00.000Z"
  }
}
```

---

### 8. Supprimer une photo
**DELETE** `/albums/admin/photos/:photoId`

Supprime une photo d'un album.

#### Paramètres URL
- `photoId`: ID de la photo

#### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Photo supprimée avec succès"
}
```

---

### 9. Réordonner les photos d'un album
**PUT** `/albums/admin/:id/photos/reorder`

Modifie l'ordre d'affichage des photos dans un album.

#### Paramètres URL
- `id`: ID de l'album

#### Body (application/json)
```json
{
  "ordres": [
    { "photo_id": 3, "ordre": 0 },
    { "photo_id": 1, "ordre": 1 },
    { "photo_id": 2, "ordre": 2 }
  ]
}
```

#### Réponse Succès (200)
```json
{
  "success": true,
  "message": "Photos réordonnées avec succès",
  "data": { /* album complet avec photos réordonnées */ }
}
```

---

## Codes d'erreur

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide (données manquantes ou incorrectes) |
| 401 | Non authentifié (token manquant ou invalide) |
| 403 | Non autorisé (rôle insuffisant) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## Formats d'images acceptés

- JPEG / JPG
- PNG
- WEBP

**Taille maximale:** 10 MB par image

---

## Exemples d'URLs complètes

- Liste des albums: `GET https://nou-backend.railway.app/albums?page=1&limit=10&est_public=true`
- Détails d'un album: `GET https://nou-backend.railway.app/albums/1`
- Créer un album: `POST https://nou-backend.railway.app/albums/admin`
- Ajouter des photos: `POST https://nou-backend.railway.app/albums/admin/1/photos`

---

## Notes pour l'intégration Frontend

1. **Authentification:** Les routes admin nécessitent un token JWT dans le header `Authorization: Bearer <token>`

2. **Upload de fichiers:** Utiliser `FormData` pour les requêtes contenant des fichiers

3. **URLs des images:** Les URLs retournées sont relatives (ex: `/uploads/albums/...`). Il faut les préfixer avec l'URL de base de l'API pour l'affichage

4. **Pagination:** Utiliser les informations de `pagination` dans la réponse pour gérer la navigation entre les pages

5. **Filtres:** Les albums peuvent être filtrés par année et visibilité pour faciliter la navigation

6. **Ordre d'affichage:** Le champ `ordre` permet de contrôler l'ordre d'affichage des albums (tri décroissant)
