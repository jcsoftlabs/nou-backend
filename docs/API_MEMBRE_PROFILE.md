# API - Gestion du Profil Membre

## Endpoints pour la mise à jour du profil

### 1. Obtenir son propre profil

**GET** `/membres/me`

**Authentification**: Requise (Token JWT)

**Réponse**:
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": 1,
    "username": "jean123",
    "code_adhesion": "AJu1234",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "photo_profil_url": "/uploads/profiles/profile_1_123456789.jpg",
    ...
  }
}
```

---

### 2. Mettre à jour son propre profil

**PUT** `/membres/me`

**Authentification**: Requise (Token JWT)

**Champs modifiables** (tous optionnels):
- `surnom`: Surnom du membre
- `photo_profil_url`: URL de la photo de profil
- `adresse_complete`: Adresse complète
- `facebook`: URL du profil Facebook
- `instagram`: URL du profil Instagram
- `telephone_etranger`: Numéro de téléphone étranger
- `email`: Adresse email (vérification d'unicité)
- `password`: Nouveau mot de passe (requiert `old_password`)
- `old_password`: Ancien mot de passe (si changement de mot de passe)

**Corps de la requête**:
```json
{
  "surnom": "Jeanjean",
  "adresse_complete": "123 Rue de la Paix, Port-au-Prince",
  "facebook": "https://facebook.com/jeandupont",
  "instagram": "@jeandupont",
  "email": "nouveau.email@example.com"
}
```

**Réponse**:
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "id": 1,
    "username": "jean123",
    "surnom": "Jeanjean",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "nouveau.email@example.com",
    ...
  }
}
```

---

### 3. Upload photo de profil

**POST** `/membres/me/photo`

**Authentification**: Requise (Token JWT)

**Content-Type**: `multipart/form-data`

**Paramètres**:
- `photo`: Fichier image (JPG, PNG)
  - Taille maximale: 5 MB
  - Formats acceptés: JPEG, JPG, PNG

**Exemple avec cURL**:
```bash
curl -X POST http://localhost:4000/membres/me/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@/path/to/profile.jpg"
```

**Exemple avec JavaScript (fetch)**:
```javascript
const formData = new FormData();
formData.append('photo', photoFile);

fetch('http://localhost:4000/membres/me/photo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Exemple avec React Native**:
```javascript
const uploadProfilePhoto = async (photoUri, token) => {
  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'profile.jpg'
  });

  const response = await fetch('http://localhost:4000/membres/me/photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  });

  return await response.json();
};
```

**Réponse**:
```json
{
  "success": true,
  "message": "Photo de profil uploadée avec succès",
  "data": {
    "photo_profil_url": "/uploads/profiles/profile_1_1234567890-987654321.jpg",
    "membre": {
      "id": 1,
      "username": "jean123",
      "nom": "Dupont",
      "prenom": "Jean",
      "photo_profil_url": "/uploads/profiles/profile_1_1234567890-987654321.jpg",
      ...
    }
  }
}
```

---

### 4. Changer son mot de passe

**PUT** `/membres/me`

**Authentification**: Requise (Token JWT)

**Corps de la requête**:
```json
{
  "old_password": "ancien_mot_de_passe",
  "password": "nouveau_mot_de_passe"
}
```

**Réponse**:
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "id": 1,
    "username": "jean123",
    ...
  }
}
```

---

## Sécurité

### Champs protégés

Les champs suivants **ne peuvent PAS** être modifiés par le membre lui-même:
- `username`
- `code_adhesion`
- `code_parrain`
- `nom`
- `prenom`
- `role_utilisateur`
- `nin`, `nif`
- `date_creation`
- `dernier_update`

Ces champs ne peuvent être modifiés que par un administrateur via l'endpoint `/admin/membres/:id`.

### Validation

- **Email**: Vérifie l'unicité avant modification
- **Mot de passe**: Requiert l'ancien mot de passe pour être changé
- **Photos**: Seulement JPG et PNG, max 5 MB

### Audit

Toutes les modifications de profil sont enregistrées dans les logs d'audit avec:
- L'utilisateur qui a effectué la modification
- Les données avant et après modification
- L'adresse IP et le user-agent
- Le timestamp

---

## Endpoint Admin

### Mettre à jour un membre (Admin uniquement)

**PUT** `/admin/membres/:id`

**Authentification**: Requise (Token JWT) + Rôle Admin

**Paramètres**:
- `:id`: ID du membre à mettre à jour

**Corps de la requête**: Tous les champs du modèle Membre sont modifiables

**Réponse**:
```json
{
  "success": true,
  "message": "Membre modifié avec succès",
  "data": {
    "id": 1,
    "username": "jean123",
    ...
  }
}
```

---

## Codes d'erreur

- **400**: Erreur de validation ou données invalides
- **401**: Token d'authentification manquant ou invalide
- **403**: Permissions insuffisantes (admin requis)
- **404**: Membre non trouvé
- **500**: Erreur serveur

---

## Notes

- Les photos de profil sont stockées dans `src/uploads/profiles/` sur le serveur
- Format de nom de fichier: `profile_{userId}_{timestamp}_{random}.ext`
- Les anciennes photos ne sont pas automatiquement supprimées (à implémenter si nécessaire)
- L'URL de la photo est relative et commence par `/uploads/profiles/`
- Pour accéder à la photo: `http://localhost:4000/uploads/profiles/filename.jpg`
- Le serveur sert les fichiers statiques depuis `src/uploads/` via la route `/uploads`
