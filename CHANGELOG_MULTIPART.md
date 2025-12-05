# Changelog - Support Multipart/Form-Data pour Inscription

Date: 2025-11-16

## 🎯 Objectif
Permettre l'upload de photo de profil lors de l'inscription via `multipart/form-data`.

---

## ✅ Modifications Effectuées

### 1. **Configuration Multer** (`src/config/upload.js`)
- Création du middleware pour gérer l'upload de fichiers
- Stockage dans `uploads/profils/`
- Validation des types de fichiers (jpeg, jpg, png, gif, webp)
- Limite de taille : 5MB
- Nom de fichier généré : `{username}_{timestamp}.{extension}`

### 2. **Routes** (`src/routes/authRoutes.js`)
- Ajout du middleware `upload.single('photo_profil')` sur la route `/auth/register`
- Le champ de fichier s'appelle `photo_profil`

### 3. **Contrôleur** (`src/controllers/authController.js`)
- Conversion automatique des types depuis FormData:
  - Booléens: `"true"` → `true`, `"false"` → `false`
  - Entiers: `"5"` → `5`
- Gestion du fichier uploadé via `req.file`
- Génération de l'URL relative: `/uploads/profils/{filename}`

### 4. **Serveur** (`src/server.js`)
- Configuration Express pour servir les fichiers statiques
- Route: `/uploads` → dossier `uploads/`

### 5. **Structure de dossiers**
```
nou-backend/
├── uploads/
│   └── profils/
│       └── .gitkeep
```

### 6. **Configuration Git** (`.gitignore`)
- Ajout de `uploads/profils/*` (sauf `.gitkeep`)

---

## 📝 API Modifiée

### Endpoint
`POST /auth/register`

### Content-Type
`multipart/form-data` (au lieu de `application/json`)

### Nouveau Champ
- `photo_profil` (File, optionnel) : Image de profil

### Formats Acceptés
- JPEG / JPG
- PNG
- GIF
- WebP

### Taille Maximum
5MB

---

## 🔄 Rétrocompatibilité

✅ **100% Rétrocompatible**

- Si aucun fichier n'est envoyé, l'inscription fonctionne comme avant
- Tous les champs restent identiques
- La validation Joi reste inchangée

---

## 📸 Accès aux Photos

### URL de la photo uploadée
```
http://localhost:4000/uploads/profils/username_1234567890.jpg
```

### Réponse API avec photo
```json
{
  "success": true,
  "data": {
    "membre": {
      "photo_profil_url": "/uploads/profils/john_doe_1234567890.jpg"
    }
  }
}
```

---

## 🧪 Tests

### Test avec cURL
```bash
curl -X POST http://localhost:4000/auth/register \
  -F "username=test_user" \
  -F "password=Test123" \
  -F "code_adhesion=EXISTING_CODE" \
  -F "nom=Test" \
  -F "prenom=User" \
  -F "telephone_principal=+50912345678" \
  -F "email=test@example.com" \
  -F "photo_profil=@/path/to/photo.jpg"
```

### Test sans photo (toujours fonctionnel)
```bash
curl -X POST http://localhost:4000/auth/register \
  -F "username=test_user" \
  -F "password=Test123" \
  -F "code_adhesion=EXISTING_CODE" \
  -F "nom=Test" \
  -F "prenom=User" \
  -F "telephone_principal=+50912345678"
```

---

## 📱 Modifications Flutter Requises

### Avant (JSON)
```dart
final response = await dio.post(
  '/auth/register',
  data: userData,
);
```

### Après (FormData)
```dart
final formData = FormData();

// Ajouter tous les champs
userData.forEach((key, value) {
  if (value != null) {
    formData.fields.add(MapEntry(key, value.toString()));
  }
});

// Ajouter la photo
if (photoFile != null) {
  formData.files.add(MapEntry(
    'photo_profil',
    await MultipartFile.fromFile(photoFile.path),
  ));
}

final response = await dio.post(
  '/auth/register',
  data: formData,
);
```

---

## 🔐 Sécurité

### Protections Implémentées
1. ✅ Validation du type MIME
2. ✅ Validation de l'extension de fichier
3. ✅ Limite de taille (5MB)
4. ✅ Nom de fichier généré automatiquement (évite collisions)
5. ✅ Dossier uploads isolé avec .gitignore

### À Implémenter (Optionnel)
- [ ] Compression d'images
- [ ] Génération de thumbnails
- [ ] Scan antivirus des fichiers
- [ ] Stockage cloud (S3, Cloudinary, etc.)

---

## 📚 Documentation

Voir `MULTIPART_UPLOAD_API.md` pour la documentation complète de l'API.

---

## ✅ Checklist de Déploiement

- [x] Configuration Multer créée
- [x] Routes mises à jour
- [x] Contrôleur modifié
- [x] Serveur configuré pour fichiers statiques
- [x] Dossier uploads créé
- [x] .gitignore mis à jour
- [x] Documentation créée
- [ ] Tests d'intégration
- [ ] Mise à jour du client Flutter
- [ ] Tests end-to-end

---

## 🚀 Prochaines Étapes

1. **Mettre à jour l'application Flutter** pour envoyer FormData
2. **Tester l'upload de photo** avec un vrai fichier
3. **Vérifier l'affichage de la photo** dans l'application
4. **(Optionnel)** Implémenter la compression d'images côté serveur
5. **(Optionnel)** Migrer vers un stockage cloud pour la production
