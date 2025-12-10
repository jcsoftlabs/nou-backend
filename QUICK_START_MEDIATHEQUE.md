# 🚀 Quick Start - Médiathèque Albums

## ✅ Ce qui a été fait (Backend)

### 1. Base de données
- ✅ Tables `albums` et `album_photos` créées en production
- ✅ Migrations SQL appliquées
- ✅ Relations et index configurés

### 2. Backend API
- ✅ Modèles Sequelize : `Album.js`, `AlbumPhoto.js`
- ✅ Service métier : `albumService.js`
- ✅ Contrôleur : `albumController.js`
- ✅ Routes : `albumRoutes.js`
- ✅ Upload configuré : `multerAlbum.js`
- ✅ **Intégration Cloudinary** : Stockage cloud des images
- ✅ Intégration dans `server.js` et `models/index.js`

### 3. Documentation
- ✅ Documentation API complète : `docs/API_ALBUMS.md`
- ✅ Guide d'intégration frontend : `docs/FRONTEND_INTEGRATION_ALBUMS.md`
- ✅ Guide Cloudinary : `CLOUDINARY_SETUP.md`
- ✅ README général : `README_MEDIATHEQUE.md`

---

## 🎯 À faire (Frontend - nou-admin)

### Étape 1 : Service API
Créer `src/services/albumService.ts` (voir `docs/FRONTEND_INTEGRATION_ALBUMS.md` lignes 37-198)

### Étape 2 : Pages
Créer dans `src/pages/mediatheque/` :
- `index.tsx` - Liste des albums
- `create.tsx` - Créer un album
- `edit/[id].tsx` - Modifier un album
- `[id].tsx` - Vue détaillée d'un album

### Étape 3 : Composants
Créer dans `src/components/mediatheque/` :
- `AlbumCard.tsx` - Carte d'affichage d'un album
- `AlbumForm.tsx` - Formulaire création/édition
- `PhotoUploader.tsx` - Upload multiple de photos
- `PhotoGallery.tsx` - Galerie avec lightbox

### Étape 4 : Navigation
Ajouter dans le menu latéral (sidebar) :
```tsx
{
  label: 'Médiathèque',
  icon: <PhotoIcon />,
  path: '/mediatheque'
}
```

---

## 📡 Endpoints disponibles

### Public (sans auth)
```
GET  /albums              # Liste des albums
GET  /albums/:id          # Détails d'un album
```

### Admin (avec JWT token)
```
POST   /albums/admin                    # Créer un album
PUT    /albums/admin/:id                # Modifier un album
DELETE /albums/admin/:id                # Supprimer un album
POST   /albums/admin/:id/photos         # Ajouter des photos
PUT    /albums/admin/photos/:photoId    # Modifier une photo
DELETE /albums/admin/photos/:photoId    # Supprimer une photo
PUT    /albums/admin/:id/photos/reorder # Réordonner les photos
```

---

## 🧪 Test rapide de l'API

### 1. Tester la liste des albums (public)
```bash
curl https://nou-backend.railway.app/albums
```

### 2. Créer un album (admin - nécessite un token)
```bash
curl -X POST https://nou-backend.railway.app/albums/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "titre=Test Album" \
  -F "description=Album de test" \
  -F "est_public=true"
```

### 3. Ajouter des photos (admin)
```bash
curl -X POST https://nou-backend.railway.app/albums/admin/1/photos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photos=@/path/to/image1.jpg" \
  -F "photos=@/path/to/image2.jpg"
```

---

## 📦 Dépendances frontend suggérées

```bash
# Pour la lightbox
npm install yet-another-react-lightbox

# Pour le drag & drop
npm install @dnd-kit/core @dnd-kit/sortable

# Pour l'upload avec preview
npm install react-dropzone

# Pour les notifications
npm install react-hot-toast
```

---

## 🔑 Points clés pour l'intégration

1. **Authentification** : Toutes les routes admin nécessitent un JWT token valide avec le rôle `admin`

2. **Upload de fichiers** : Utiliser `FormData` pour les requêtes avec fichiers

3. **URLs des images** : Les URLs retournées sont des **URLs Cloudinary complètes**
   ```
   https://res.cloudinary.com/CLOUD_NAME/image/upload/v123/nou/albums/photos/photo.jpg
   ```
   - ✅ Directement utilisables dans le frontend (pas de préfixe à ajouter)
   - ✅ Distribuées via CDN global
   - ✅ Permanentes et fiables

4. **Cloudinary REQUIS** : Configurer les variables d'environnement Cloudinary (voir `CLOUDINARY_SETUP.md`)

5. **Formats acceptés** : JPEG, JPG, PNG, WEBP (max 10MB par image)

6. **Upload multiple** : Jusqu'à 50 photos à la fois

---

## 📂 Structure recommandée

```
nou-admin/
├── src/
│   ├── pages/
│   │   └── mediatheque/
│   │       ├── index.tsx
│   │       ├── [id].tsx
│   │       ├── create.tsx
│   │       └── edit/[id].tsx
│   ├── components/
│   │   └── mediatheque/
│   │       ├── AlbumCard.tsx
│   │       ├── AlbumForm.tsx
│   │       ├── PhotoUploader.tsx
│   │       └── PhotoGallery.tsx
│   └── services/
│       └── albumService.ts
```

---

## 🎨 Exemple de code minimal

### Service API (TypeScript)
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const albumService = {
  async getAlbums(params) {
    const { data } = await axios.get(`${API_URL}/albums`, { params });
    return data;
  },
  
  async createAlbum(formData) {
    const { data } = await axios.post(
      `${API_URL}/albums/admin`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return data;
  }
};
```

### Liste des albums (React)
```tsx
export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    albumService.getAlbums({ page: 1, limit: 12 })
      .then(res => setAlbums(res.data));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {albums.map(album => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  );
}
```

---

## 📖 Documentation détaillée

- **API complète** : `docs/API_ALBUMS.md`
- **Guide d'intégration** : `docs/FRONTEND_INTEGRATION_ALBUMS.md`
- **README général** : `README_MEDIATHEQUE.md`

---

## ✅ Checklist finale

Backend :
- [x] Base de données prête
- [x] API opérationnelle
- [x] Documentation complète

Frontend (à faire) :
- [ ] Service API implémenté
- [ ] Pages créées
- [ ] Composants développés
- [ ] Navigation configurée
- [ ] Tests effectués

---

## 🆘 Besoin d'aide ?

1. Consulter les exemples de code dans `docs/FRONTEND_INTEGRATION_ALBUMS.md`
2. Tester les endpoints avec cURL ou Postman
3. Vérifier l'authentification et les tokens JWT
4. S'assurer que l'URL de l'API est correcte dans les variables d'environnement

---

**Backend prêt à 100% ✅**
**Frontend à implémenter 🚧**

Date : 10 décembre 2024
