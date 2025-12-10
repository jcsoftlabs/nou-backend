const { Album, AlbumPhoto, Membre } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

/**
 * Service pour gérer les albums et leurs photos
 */
const albumService = {
  /**
   * Créer un nouvel album
   * @param {Object} albumData - Données de l'album
   * @param {number} auteurId - ID de l'admin créateur
   * @returns {Promise<Object>} Album créé
   */
  async creerAlbum(albumData, auteurId) {
    const album = await Album.create({
      ...albumData,
      auteur_id: auteurId
    });
    
    return album;
  },

  /**
   * Obtenir tous les albums avec pagination et filtres
   * @param {Object} options - Options de recherche
   * @returns {Promise<Object>} Liste des albums paginée
   */
  async getAlbums(options = {}) {
    const {
      page = 1,
      limit = 10,
      estPublic = null,
      anneeFiltree = null,
      includePhotos = false
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtre par visibilité
    if (estPublic !== null) {
      where.est_public = estPublic;
    }

    // Filtre par année
    if (anneeFiltree) {
      where.date_evenement = {
        [Op.between]: [`${anneeFiltree}-01-01`, `${anneeFiltree}-12-31`]
      };
    }

    const include = [
      {
        model: Membre,
        as: 'auteur',
        attributes: ['id', 'nom', 'prenom']
      }
    ];

    // Inclure les photos si demandé
    if (includePhotos) {
      include.push({
        model: AlbumPhoto,
        as: 'photos',
        order: [['ordre', 'ASC'], ['created_at', 'ASC']]
      });
    }

    const { count, rows } = await Album.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['ordre', 'DESC'], ['date_evenement', 'DESC'], ['created_at', 'DESC']],
      distinct: true
    });

    return {
      albums: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  },

  /**
   * Obtenir un album par son ID
   * @param {number} albumId - ID de l'album
   * @returns {Promise<Object>} Album avec ses photos
   */
  async getAlbumById(albumId) {
    const album = await Album.findByPk(albumId, {
      include: [
        {
          model: Membre,
          as: 'auteur',
          attributes: ['id', 'nom', 'prenom']
        },
        {
          model: AlbumPhoto,
          as: 'photos',
          order: [['ordre', 'ASC'], ['created_at', 'ASC']]
        }
      ]
    });

    if (!album) {
      throw new Error('Album non trouvé');
    }

    return album;
  },

  /**
   * Mettre à jour un album
   * @param {number} albumId - ID de l'album
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Album mis à jour
   */
  async updateAlbum(albumId, updateData) {
    const album = await Album.findByPk(albumId);
    
    if (!album) {
      throw new Error('Album non trouvé');
    }

    await album.update(updateData);
    
    return await this.getAlbumById(albumId);
  },

  /**
   * Supprimer un album et ses photos
   * @param {number} albumId - ID de l'album
   */
  async deleteAlbum(albumId) {
    const album = await this.getAlbumById(albumId);
    
    // Supprimer les fichiers physiques des photos
    if (album.photos && album.photos.length > 0) {
      for (const photo of album.photos) {
        this.supprimerFichierPhoto(photo.url_photo);
      }
    }

    // Supprimer le fichier de couverture si présent
    if (album.image_couverture) {
      this.supprimerFichierPhoto(album.image_couverture);
    }

    await album.destroy();
  },

  /**
   * Ajouter des photos à un album
   * @param {number} albumId - ID de l'album
   * @param {Array} photos - Tableau de photos à ajouter
   * @returns {Promise<Array>} Photos créées
   */
  async ajouterPhotos(albumId, photos) {
    const album = await Album.findByPk(albumId);
    
    if (!album) {
      throw new Error('Album non trouvé');
    }

    const photosCreees = await AlbumPhoto.bulkCreate(
      photos.map((photo, index) => ({
        album_id: albumId,
        url_photo: photo.url_photo,
        legende: photo.legende || null,
        ordre: photo.ordre !== undefined ? photo.ordre : index
      }))
    );

    return photosCreees;
  },

  /**
   * Mettre à jour une photo
   * @param {number} photoId - ID de la photo
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Photo mise à jour
   */
  async updatePhoto(photoId, updateData) {
    const photo = await AlbumPhoto.findByPk(photoId);
    
    if (!photo) {
      throw new Error('Photo non trouvée');
    }

    await photo.update(updateData);
    
    return photo;
  },

  /**
   * Supprimer une photo
   * @param {number} photoId - ID de la photo
   */
  async deletePhoto(photoId) {
    const photo = await AlbumPhoto.findByPk(photoId);
    
    if (!photo) {
      throw new Error('Photo non trouvée');
    }

    // Supprimer le fichier physique
    this.supprimerFichierPhoto(photo.url_photo);

    await photo.destroy();
  },

  /**
   * Supprimer le fichier physique d'une photo
   * @param {string} urlPhoto - URL de la photo
   */
  async supprimerFichierPhoto(urlPhoto) {
    if (!urlPhoto) return;

    try {
      // Si c'est une URL Cloudinary, extraire le public_id et supprimer
      if (urlPhoto.includes('cloudinary.com')) {
        // Extraire le public_id de l'URL Cloudinary
        // Format: https://res.cloudinary.com/CLOUD_NAME/image/upload/v123456/nou/albums/photo_123.jpg
        const matches = urlPhoto.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp)$/i);
        if (matches && matches[1]) {
          const publicId = matches[1];
          await cloudinary.uploader.destroy(publicId);
          console.log(`Photo Cloudinary supprimée: ${publicId}`);
        }
      } else {
        // Fallback: fichier local (dev)
        const filename = urlPhoto.split('/').pop();
        const filepath = path.join(__dirname, '../uploads/albums', filename);
        
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }
  },

  /**
   * Réordonner les photos d'un album
   * @param {number} albumId - ID de l'album
   * @param {Array} ordres - Tableau [{photo_id, ordre}, ...]
   */
  async reordonnerPhotos(albumId, ordres) {
    const album = await Album.findByPk(albumId);
    
    if (!album) {
      throw new Error('Album non trouvé');
    }

    // Mettre à jour l'ordre de chaque photo
    for (const item of ordres) {
      await AlbumPhoto.update(
        { ordre: item.ordre },
        { where: { id: item.photo_id, album_id: albumId } }
      );
    }

    return await this.getAlbumById(albumId);
  }
};

module.exports = albumService;
