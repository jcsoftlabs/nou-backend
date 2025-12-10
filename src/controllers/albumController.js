const albumService = require('../services/albumService');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Contrôleur pour gérer les albums et leurs photos
 */
const albumController = {
  /**
   * Obtenir tous les albums avec filtres
   * GET /albums
   * Query params: page, limit, est_public, annee, include_photos
   */
  async getAlbums(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        est_public,
        annee,
        include_photos
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        estPublic: est_public === 'true' ? true : est_public === 'false' ? false : null,
        anneeFiltree: annee ? parseInt(annee) : null,
        includePhotos: include_photos === 'true'
      };

      const result = await albumService.getAlbums(options);

      res.status(200).json({
        success: true,
        data: result.albums,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des albums:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des albums',
        error: error.message
      });
    }
  },

  /**
   * Obtenir un album par son ID avec toutes ses photos
   * GET /albums/:id
   */
  async getAlbumById(req, res) {
    try {
      const { id } = req.params;

      const album = await albumService.getAlbumById(id);

      res.status(200).json({
        success: true,
        data: album
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'album:', error);
      
      if (error.message === 'Album non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'album',
        error: error.message
      });
    }
  },

  /**
   * Créer un nouvel album (Admin uniquement)
   * POST /admin/albums
   * Body: { titre, description, date_evenement, lieu_evenement, est_public, ordre }
   * Files: image_couverture (optionnel)
   */
  async createAlbum(req, res) {
    try {
      const {
        titre,
        description,
        date_evenement,
        lieu_evenement,
        est_public,
        ordre
      } = req.body;

      // Vérifier les champs requis
      if (!titre) {
        return res.status(400).json({
          success: false,
          message: 'Le titre est requis'
        });
      }

      const albumData = {
        titre,
        description,
        date_evenement: date_evenement || null,
        lieu_evenement: lieu_evenement || null,
        est_public: est_public === 'false' ? false : true,
        ordre: ordre ? parseInt(ordre) : 0
      };

      // Ajouter l'image de couverture si uploadée
      if (req.file) {
        // Upload vers Cloudinary si configuré
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
        ) {
          const coverUpload = await cloudinary.uploader.upload(req.file.path, {
            folder: 'nou/albums/covers',
            public_id: `album_cover_${Date.now()}`
          });
          albumData.image_couverture = coverUpload.secure_url;
          
          // Supprimer le fichier local temporaire
          fs.unlink(req.file.path, () => {});
        } else {
          // Fallback local (dev)
          albumData.image_couverture = `/uploads/albums/${req.file.filename}`;
        }
      }

      const album = await albumService.creerAlbum(albumData, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Album créé avec succès',
        data: album
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'album:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'album',
        error: error.message
      });
    }
  },

  /**
   * Mettre à jour un album (Admin uniquement)
   * PUT /admin/albums/:id
   * Body: { titre, description, date_evenement, lieu_evenement, est_public, ordre }
   * Files: image_couverture (optionnel)
   */
  async updateAlbum(req, res) {
    try {
      const { id } = req.params;
      const {
        titre,
        description,
        date_evenement,
        lieu_evenement,
        est_public,
        ordre
      } = req.body;

      const updateData = {};

      if (titre !== undefined) updateData.titre = titre;
      if (description !== undefined) updateData.description = description;
      if (date_evenement !== undefined) updateData.date_evenement = date_evenement;
      if (lieu_evenement !== undefined) updateData.lieu_evenement = lieu_evenement;
      if (est_public !== undefined) updateData.est_public = est_public === 'false' ? false : true;
      if (ordre !== undefined) updateData.ordre = parseInt(ordre);

      // Ajouter la nouvelle image de couverture si uploadée
      if (req.file) {
        // Upload vers Cloudinary si configuré
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
        ) {
          const coverUpload = await cloudinary.uploader.upload(req.file.path, {
            folder: 'nou/albums/covers',
            public_id: `album_cover_${Date.now()}`
          });
          updateData.image_couverture = coverUpload.secure_url;
          
          // Supprimer le fichier local temporaire
          fs.unlink(req.file.path, () => {});
        } else {
          // Fallback local (dev)
          updateData.image_couverture = `/uploads/albums/${req.file.filename}`;
        }
      }

      const album = await albumService.updateAlbum(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Album mis à jour avec succès',
        data: album
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'album:', error);
      
      if (error.message === 'Album non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'album',
        error: error.message
      });
    }
  },

  /**
   * Supprimer un album (Admin uniquement)
   * DELETE /admin/albums/:id
   */
  async deleteAlbum(req, res) {
    try {
      const { id } = req.params;

      await albumService.deleteAlbum(id);

      res.status(200).json({
        success: true,
        message: 'Album supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'album:', error);
      
      if (error.message === 'Album non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'album',
        error: error.message
      });
    }
  },

  /**
   * Ajouter des photos à un album (Admin uniquement)
   * POST /admin/albums/:id/photos
   * Body: { legendes: [string] } (optionnel, tableau de légendes correspondant aux fichiers)
   * Files: photos[] (multiple)
   */
  async addPhotos(req, res) {
    try {
      const { id } = req.params;
      const { legendes } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucune photo fournie'
        });
      }

      // Parser les légendes si elles sont fournies en JSON string
      let legendesArray = [];
      if (legendes) {
        try {
          legendesArray = typeof legendes === 'string' ? JSON.parse(legendes) : legendes;
        } catch (e) {
          legendesArray = [];
        }
      }

      // Upload des photos vers Cloudinary si configuré
      const photosData = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        let photoUrl;
        
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
        ) {
          // Upload vers Cloudinary
          const photoUpload = await cloudinary.uploader.upload(file.path, {
            folder: 'nou/albums/photos',
            public_id: `album_photo_${id}_${Date.now()}_${i}`
          });
          photoUrl = photoUpload.secure_url;
          
          // Supprimer le fichier local temporaire
          fs.unlink(file.path, () => {});
        } else {
          // Fallback local (dev)
          photoUrl = `/uploads/albums/${file.filename}`;
        }
        
        photosData.push({
          url_photo: photoUrl,
          legende: legendesArray[i] || null,
          ordre: i
        });
      }

      const photosCreees = await albumService.ajouterPhotos(id, photosData);

      res.status(201).json({
        success: true,
        message: `${photosCreees.length} photo(s) ajoutée(s) avec succès`,
        data: photosCreees
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout des photos:', error);
      
      if (error.message === 'Album non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout des photos',
        error: error.message
      });
    }
  },

  /**
   * Mettre à jour une photo (Admin uniquement)
   * PUT /admin/albums/photos/:photoId
   * Body: { legende, ordre }
   */
  async updatePhoto(req, res) {
    try {
      const { photoId } = req.params;
      const { legende, ordre } = req.body;

      const updateData = {};
      if (legende !== undefined) updateData.legende = legende;
      if (ordre !== undefined) updateData.ordre = parseInt(ordre);

      const photo = await albumService.updatePhoto(photoId, updateData);

      res.status(200).json({
        success: true,
        message: 'Photo mise à jour avec succès',
        data: photo
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      
      if (error.message === 'Photo non trouvée') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la photo',
        error: error.message
      });
    }
  },

  /**
   * Supprimer une photo (Admin uniquement)
   * DELETE /admin/albums/photos/:photoId
   */
  async deletePhoto(req, res) {
    try {
      const { photoId } = req.params;

      await albumService.deletePhoto(photoId);

      res.status(200).json({
        success: true,
        message: 'Photo supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      
      if (error.message === 'Photo non trouvée') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la photo',
        error: error.message
      });
    }
  },

  /**
   * Réordonner les photos d'un album (Admin uniquement)
   * PUT /admin/albums/:id/photos/reorder
   * Body: { ordres: [{photo_id: number, ordre: number}, ...] }
   */
  async reorderPhotos(req, res) {
    try {
      const { id } = req.params;
      const { ordres } = req.body;

      if (!ordres || !Array.isArray(ordres)) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre ordres doit être un tableau'
        });
      }

      const album = await albumService.reordonnerPhotos(id, ordres);

      res.status(200).json({
        success: true,
        message: 'Photos réordonnées avec succès',
        data: album
      });
    } catch (error) {
      console.error('Erreur lors du réordonnancement des photos:', error);
      
      if (error.message === 'Album non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors du réordonnancement des photos',
        error: error.message
      });
    }
  }
};

module.exports = albumController;
