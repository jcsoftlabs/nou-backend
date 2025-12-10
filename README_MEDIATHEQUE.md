# Médiathèque - Fonctionnalité Albums Photo

Cette fonctionnalité permet aux administrateurs de créer et gérer des albums photo d'événements organisés par le parti politique. Les albums peuvent être publics (visibles par tous) ou privés (accessibles uniquement aux admins).

## 📋 Fonctionnalités

### Pour les administrateurs
- ✅ Créer des albums avec titre, description, date et lieu de l'événement
- ✅ Uploader une image de couverture pour chaque album
- ✅ Ajouter plusieurs photos à un album (jusqu'à 50 à la fois)
- ✅ Ajouter des légendes aux photos
- ✅ Réordonner les photos dans un album
- ✅ Modifier les informations d'un album
- ✅ Supprimer des albums et des photos
- ✅ Contrôler la visibilité (public/privé) des albums

### Pour les utilisateurs publics
- ✅ Consulter la liste des albums publics
- ✅ Voir les détails d'un album et toutes ses photos
- ✅ Filtrer les albums par année
- ✅ Pagination pour une navigation facile

---

## 🗂️ Structure de la base de données

### Table `albums`
Stocke les informations des albums photo.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT | Identifiant unique (auto-incrémenté) |
| `titre` | VARCHAR(255) | Titre de l'album (requis) |
| `description` | TEXT | Description détaillée de l'album |
| `date_evenement` | DATE | Date de l'événement |
| `lieu_evenement` | VARCHAR(255) | Lieu où l'événement a eu lieu |
| `image_couverture` | VARCHAR(500) | URL de l'image de couverture |
| `est_public` | BOOLEAN | Visibilité de l'album (défaut: true) |
| `ordre` | INT | Ordre d'affichage (défaut: 0) |
| `auteur_id` | INT | ID de l'admin créateur (FK vers `membres`) |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de dernière modification |

### Table `album_photos`
Stocke les photos appartenant aux albums.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT | Identifiant unique (auto-incrémenté) |
| `album_id` | INT | ID de l'album (FK vers `albums`) |
| `url_photo` | VARCHAR(500) | URL de la photo |
| `legende` | TEXT | Légende/description de la photo |
| `ordre` | INT | Ordre d'affichage dans l'album |
| `created_at` | TIMESTAMP | Date d'ajout |

**Relations:**
- Un album appartient à un membre (auteur)
- Un album contient plusieurs photos
- Suppression en cascade : supprimer un album supprime toutes ses photos

---

## 🔧 Installation et Configuration

### 1. Appliquer la migration

La migration SQL a déjà été appliquée sur la base de production. Pour l'appliquer sur une nouvelle base locale :

```bash
mysql -h localhost -u root -p nom_base_de_donnees < src/migrations/012_create_albums_tables.sql
```

### 2. Démarrer le serveur

```bash
# Installation des dépendances (si nécessaire)
npm install

# Démarrage en mode développement
npm run dev

# Ou en mode production
npm start
```

Le serveur démarre sur le port `4000` par défaut.

---

## 📡 API Endpoints

### Routes publiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/albums` | Liste des albums (avec filtres et pagination) |
| GET | `/albums/:id` | Détails d'un album avec ses photos |

### Routes admin (authentification requise)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/albums/admin` | Créer un nouvel album |
| PUT | `/albums/admin/:id` | Modifier un album |
| DELETE | `/albums/admin/:id` | Supprimer un album |
| POST | `/albums/admin/:id/photos` | Ajouter des photos à un album |
| PUT | `/albums/admin/photos/:photoId` | Modifier une photo (légende, ordre) |
| DELETE | `/albums/admin/photos/:photoId` | Supprimer une photo |
| PUT | `/albums/admin/:id/photos/reorder` | Réordonner les photos |

---

## 📁 Architecture du code

```
src/
├── models/
│   ├── Album.js              # Modèle Sequelize pour les albums
│   └── AlbumPhoto.js         # Modèle Sequelize pour les photos
├── services/
│   └── albumService.js       # Logique métier pour les albums
├── controllers/
│   └── albumController.js    # Contrôleurs HTTP pour les albums
├── routes/
│   └── albumRoutes.js        # Définition des routes
├── config/
│   └── multerAlbum.js        # Configuration upload de photos
├── migrations/
│   └── 012_create_albums_tables.sql  # Migration SQL
└── uploads/
    └── albums/               # Stockage des photos uploadées
```

### Flux de traitement d'une requête

```
Client Request
    ↓
albumRoutes.js (validation, middleware upload)
    ↓
albumController.js (gestion HTTP)
    ↓
albumService.js (logique métier)
    ↓
Models (Album, AlbumPhoto) → Base de données
    ↓
Response au client
```

---

## 🖼️ Gestion des fichiers

### Upload
- **Dossier de stockage:** `src/uploads/albums/`
- **Formats acceptés:** JPEG, JPG, PNG, WEBP
- **Taille maximale:** 10 MB par image
- **Limite d'upload multiple:** 50 photos à la fois

### Nommage des fichiers
Les fichiers sont automatiquement renommés selon le format :
```
album_[timestamp]_[random]_[nom_original].extension
```
Exemple : `album_1703123456_789012345_congres.jpg`

### URLs des images
Les URLs retournées par l'API sont relatives :
```
/uploads/albums/album_1703123456_789012345_congres.jpg
```

Pour afficher les images dans le frontend, préfixer avec l'URL de base de l'API :
```
https://nou-backend.railway.app/uploads/albums/album_1703123456_789012345_congres.jpg
```

---

## 🔐 Sécurité et permissions

### Authentification
Les routes admin nécessitent :
1. Un token JWT valide dans le header `Authorization: Bearer <token>`
2. Le rôle `admin` pour l'utilisateur authentifié

### Validation des fichiers
- Vérification du type MIME et de l'extension
- Limitation de la taille des fichiers
- Nettoyage du nom de fichier (caractères spéciaux supprimés)

### Suppression sécurisée
Lors de la suppression d'un album ou d'une photo :
1. Suppression de l'entrée en base de données
2. Suppression automatique du fichier physique du serveur

---

## 📚 Documentation

- **Documentation API complète:** `docs/API_ALBUMS.md`
- **Guide d'intégration Frontend:** `docs/FRONTEND_INTEGRATION_ALBUMS.md`

---

## 🧪 Test de l'API

### Exemple avec cURL - Créer un album

```bash
curl -X POST https://nou-backend.railway.app/albums/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "titre=Congrès National 2024" \
  -F "description=Photos officielles du congrès" \
  -F "date_evenement=2024-03-15" \
  -F "lieu_evenement=Port-au-Prince" \
  -F "est_public=true" \
  -F "image_couverture=@/path/to/cover.jpg"
```

### Exemple avec cURL - Ajouter des photos

```bash
curl -X POST https://nou-backend.railway.app/albums/admin/1/photos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.jpg" \
  -F "photos=@/path/to/photo3.jpg" \
  -F 'legendes=["Ouverture du congrès","Discours principal","Photo de groupe"]'
```

### Exemple avec cURL - Récupérer les albums

```bash
# Liste des albums publics
curl https://nou-backend.railway.app/albums?page=1&limit=10&est_public=true

# Détails d'un album
curl https://nou-backend.railway.app/albums/1
```

---

## 🚀 Déploiement

### Production (Railway)

Le backend est déployé sur Railway avec l'URL :
```
https://nou-backend.railway.app
```

Base de données MySQL :
```
Host: mainline.proxy.rlwy.net
Port: 18580
Database: railway
User: root
```

La migration a déjà été appliquée sur la base de production.

### Variables d'environnement requises

```env
PORT=4000
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=18580
DB_NAME=railway
DB_USER=root
DB_PASSWORD=VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz
JWT_SECRET=your_jwt_secret
```

---

## 🛠️ Développement Frontend

Pour intégrer cette fonctionnalité dans le dashboard admin :

1. **Consulter le guide d'intégration:** `docs/FRONTEND_INTEGRATION_ALBUMS.md`
2. **Implémenter le service API** (exemples fournis dans le guide)
3. **Créer les composants UI** :
   - Liste des albums
   - Formulaire de création/édition
   - Upload de photos
   - Galerie de photos avec lightbox
4. **Ajouter l'entrée "Médiathèque"** dans le menu latéral du dashboard

---

## ✅ Checklist d'intégration

### Backend (Complété ✅)
- [x] Modèles Sequelize créés
- [x] Migration SQL appliquée
- [x] Service métier implémenté
- [x] Contrôleurs HTTP créés
- [x] Routes configurées
- [x] Configuration Multer pour upload
- [x] Intégration dans server.js
- [x] Documentation API rédigée

### Frontend (À faire)
- [ ] Créer le service API (albumService)
- [ ] Implémenter la page liste des albums
- [ ] Créer le formulaire de création/édition
- [ ] Développer l'interface d'upload de photos
- [ ] Ajouter une galerie avec lightbox
- [ ] Implémenter le réordonnancement drag & drop
- [ ] Ajouter l'entrée dans le menu de navigation
- [ ] Tests utilisateur

---

## 📞 Support

Pour toute question technique ou problème d'intégration :
- Consulter la documentation complète dans le dossier `docs/`
- Vérifier les logs du serveur pour les erreurs
- S'assurer que les permissions et l'authentification sont correctement configurées

---

## 📝 Notes importantes

1. **Stockage des fichiers:** Les photos sont stockées localement sur le serveur. Pour une solution plus scalable, considérer l'utilisation d'un service de stockage cloud (AWS S3, Cloudinary, etc.)

2. **Optimisation des images:** Le backend ne compresse pas automatiquement les images. Considérer l'ajout d'une compression automatique côté serveur ou frontend.

3. **Sauvegardes:** S'assurer que le dossier `src/uploads/albums/` est inclus dans les sauvegardes régulières.

4. **Performance:** Pour de nombreux albums avec beaucoup de photos, considérer l'ajout de la pagination au niveau des photos également.

---

Dernière mise à jour : 10 décembre 2024
