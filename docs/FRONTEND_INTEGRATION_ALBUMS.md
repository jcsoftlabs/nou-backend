# Guide d'intégration Frontend - Médiathèque

Ce guide explique comment intégrer la fonctionnalité médiathèque dans le dashboard admin (nou-admin).

## Structure recommandée pour le Frontend

### 1. Pages à créer

```
src/
├── pages/
│   └── mediatheque/
│       ├── index.tsx              # Liste des albums
│       ├── [id].tsx               # Vue détaillée d'un album
│       ├── create.tsx             # Créer un nouvel album
│       └── edit/[id].tsx          # Modifier un album
```

### 2. Composants suggérés

```
src/
├── components/
│   └── mediatheque/
│       ├── AlbumCard.tsx          # Card pour afficher un album
│       ├── AlbumForm.tsx          # Formulaire création/édition d'album
│       ├── PhotoUploader.tsx      # Upload multiple de photos
│       ├── PhotoGallery.tsx       # Galerie de photos avec lightbox
│       ├── PhotoCard.tsx          # Card individuelle pour une photo
│       └── PhotoReorder.tsx       # Interface drag & drop pour réordonnancement
```

---

## Exemples de code Frontend

### 1. Service API (albumService.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Album {
  id: number;
  titre: string;
  description: string;
  date_evenement: string;
  lieu_evenement: string;
  image_couverture: string;
  est_public: boolean;
  ordre: number;
  auteur_id: number;
  created_at: string;
  updated_at: string;
  auteur?: {
    id: number;
    nom: string;
    prenom: string;
  };
  photos?: Photo[];
}

interface Photo {
  id: number;
  album_id: number;
  url_photo: string;
  legende: string;
  ordre: number;
  created_at: string;
}

class AlbumService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token'); // ou votre méthode de stockage
    return {
      Authorization: `Bearer ${token}`
    };
  }

  // Récupérer tous les albums
  async getAlbums(params: {
    page?: number;
    limit?: number;
    est_public?: boolean;
    annee?: number;
    include_photos?: boolean;
  }) {
    const response = await axios.get(`${API_BASE_URL}/albums`, { params });
    return response.data;
  }

  // Récupérer un album par ID
  async getAlbumById(id: number) {
    const response = await axios.get(`${API_BASE_URL}/albums/${id}`);
    return response.data;
  }

  // Créer un album (Admin)
  async createAlbum(albumData: FormData) {
    const response = await axios.post(
      `${API_BASE_URL}/albums/admin`,
      albumData,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  // Mettre à jour un album (Admin)
  async updateAlbum(id: number, albumData: FormData) {
    const response = await axios.put(
      `${API_BASE_URL}/albums/admin/${id}`,
      albumData,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  // Supprimer un album (Admin)
  async deleteAlbum(id: number) {
    const response = await axios.delete(
      `${API_BASE_URL}/albums/admin/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    );
    return response.data;
  }

  // Ajouter des photos à un album (Admin)
  async addPhotos(albumId: number, photos: FormData) {
    const response = await axios.post(
      `${API_BASE_URL}/albums/admin/${albumId}/photos`,
      photos,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  // Mettre à jour une photo (Admin)
  async updatePhoto(photoId: number, data: { legende?: string; ordre?: number }) {
    const response = await axios.put(
      `${API_BASE_URL}/albums/admin/photos/${photoId}`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
    return response.data;
  }

  // Supprimer une photo (Admin)
  async deletePhoto(photoId: number) {
    const response = await axios.delete(
      `${API_BASE_URL}/albums/admin/photos/${photoId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
    return response.data;
  }

  // Réordonner les photos (Admin)
  async reorderPhotos(albumId: number, ordres: Array<{ photo_id: number; ordre: number }>) {
    const response = await axios.put(
      `${API_BASE_URL}/albums/admin/${albumId}/photos/reorder`,
      { ordres },
      {
        headers: this.getAuthHeaders()
      }
    );
    return response.data;
  }

  // Helper pour obtenir l'URL complète d'une image
  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    return `${API_BASE_URL}${relativePath}`;
  }
}

export default new AlbumService();
```

---

### 2. Composant AlbumForm (React/Next.js)

```tsx
import React, { useState } from 'react';
import albumService from '@/services/albumService';

interface AlbumFormProps {
  initialData?: any;
  onSuccess?: () => void;
  isEdit?: boolean;
}

export const AlbumForm: React.FC<AlbumFormProps> = ({ 
  initialData, 
  onSuccess, 
  isEdit = false 
}) => {
  const [formData, setFormData] = useState({
    titre: initialData?.titre || '',
    description: initialData?.description || '',
    date_evenement: initialData?.date_evenement || '',
    lieu_evenement: initialData?.lieu_evenement || '',
    est_public: initialData?.est_public ?? true,
    ordre: initialData?.ordre || 0
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date_evenement', formData.date_evenement);
      formDataToSend.append('lieu_evenement', formData.lieu_evenement);
      formDataToSend.append('est_public', String(formData.est_public));
      formDataToSend.append('ordre', String(formData.ordre));

      if (coverImage) {
        formDataToSend.append('image_couverture', coverImage);
      }

      if (isEdit && initialData?.id) {
        await albumService.updateAlbum(initialData.id, formDataToSend);
      } else {
        await albumService.createAlbum(formDataToSend);
      }

      alert('Album enregistré avec succès !');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement de l\'album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Titre *</label>
        <input
          type="text"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Date de l'événement</label>
          <input
            type="date"
            value={formData.date_evenement}
            onChange={(e) => setFormData({ ...formData, date_evenement: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Lieu de l'événement</label>
          <input
            type="text"
            value={formData.lieu_evenement}
            onChange={(e) => setFormData({ ...formData, lieu_evenement: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">Image de couverture</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
          className="w-full"
        />
        {initialData?.image_couverture && !coverImage && (
          <img
            src={albumService.getImageUrl(initialData.image_couverture)}
            alt="Couverture actuelle"
            className="mt-2 h-32 object-cover rounded"
          />
        )}
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.est_public}
            onChange={(e) => setFormData({ ...formData, est_public: e.target.checked })}
            className="mr-2"
          />
          Album public
        </label>

        <div>
          <label className="block mb-1">Ordre</label>
          <input
            type="number"
            value={formData.ordre}
            onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) })}
            className="w-20 px-2 py-1 border rounded"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'album'}
      </button>
    </form>
  );
};
```

---

### 3. Composant PhotoUploader

```tsx
import React, { useState } from 'react';
import albumService from '@/services/albumService';

interface PhotoUploaderProps {
  albumId: number;
  onSuccess?: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ albumId, onSuccess }) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [legendes, setLegendes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
    setLegendes(new Array(files.length).fill(''));
  };

  const handleLegendeChange = (index: number, value: string) => {
    const newLegendes = [...legendes];
    newLegendes[index] = value;
    setLegendes(newLegendes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      alert('Veuillez sélectionner au moins une photo');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
      formData.append('legendes', JSON.stringify(legendes));

      await albumService.addPhotos(albumId, formData);
      alert(`${photos.length} photo(s) ajoutée(s) avec succès !`);
      setPhotos([]);
      setLegendes([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout des photos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-xl font-semibold mb-4">Ajouter des photos</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Sélectionner les photos (max 50)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        {photos.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold">{photos.length} photo(s) sélectionnée(s)</p>
            {photos.map((photo, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="w-40 truncate">{photo.name}</span>
                <input
                  type="text"
                  placeholder="Légende (optionnel)"
                  value={legendes[index] || ''}
                  onChange={(e) => handleLegendeChange(index, e.target.value)}
                  className="flex-1 px-3 py-1 border rounded"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || photos.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Upload en cours...' : 'Ajouter les photos'}
        </button>
      </form>
    </div>
  );
};
```

---

### 4. Page Liste des albums

```tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import albumService from '@/services/albumService';

export default function AlbumsListPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadAlbums();
  }, [page]);

  const loadAlbums = async () => {
    try {
      const response = await albumService.getAlbums({
        page,
        limit: 12,
        include_photos: false
      });
      setAlbums(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) return;

    try {
      await albumService.deleteAlbum(id);
      alert('Album supprimé avec succès');
      loadAlbums();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Médiathèque</h1>
        <button
          onClick={() => router.push('/mediatheque/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nouvel album
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {albums.map((album: any) => (
          <div key={album.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            <img
              src={album.image_couverture ? albumService.getImageUrl(album.image_couverture) : '/placeholder.jpg'}
              alt={album.titre}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{album.titre}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {album.date_evenement && new Date(album.date_evenement).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-500 mb-4">{album.lieu_evenement}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/mediatheque/${album.id}`)}
                  className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Voir
                </button>
                <button
                  onClick={() => router.push(`/mediatheque/edit/${album.id}`)}
                  className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(album.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-4 py-2">
            Page {page} sur {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Recommandations UI/UX

### 1. Navigation dans le menu latéral (sidebar)

Ajouter un item dans le menu admin :

```tsx
{
  label: 'Médiathèque',
  icon: <PhotoIcon />,
  path: '/mediatheque',
  badge: albumCount // optionnel
}
```

### 2. Bibliothèques recommandées

- **Lightbox:** `yet-another-react-lightbox` pour afficher les photos en plein écran
- **Drag & Drop:** `react-beautiful-dnd` ou `@dnd-kit/core` pour réordonner les photos
- **Upload:** `react-dropzone` pour une meilleure UX d'upload
- **Toast notifications:** `react-hot-toast` ou `sonner` pour les notifications

### 3. Features suggérées

- ✅ Visualisation en grille des albums
- ✅ Filtrage par année
- ✅ Recherche par titre/lieu
- ✅ Lightbox pour voir les photos en grand
- ✅ Réordonnancement drag & drop des photos
- ✅ Upload multiple avec preview
- ✅ Édition des légendes en inline
- ✅ Badge pour indiquer les albums publics/privés

---

## Points importants

1. **Authentification:** Toutes les routes admin nécessitent un token JWT valide
2. **Gestion des erreurs:** Implémenter une gestion robuste des erreurs (fichiers trop gros, formats non supportés, etc.)
3. **Performance:** Utiliser la pagination côté serveur pour éviter de charger trop d'albums à la fois
4. **Images:** Les URLs d'images retournées sont relatives, il faut les préfixer avec l'URL de l'API
5. **Optimisation:** Considérer l'utilisation de Next.js Image pour l'optimisation automatique des images

---

## Support

Pour toute question ou problème d'intégration, référez-vous à la documentation complète de l'API dans `docs/API_ALBUMS.md`.
