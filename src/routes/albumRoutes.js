const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const uploadAlbum = require('../config/multerAlbum');

/**
 * Routes publiques pour les albums
 */

/**
 * @route   GET /albums
 * @desc    Obtenir tous les albums publics avec pagination et filtres
 * @query   page, limit, est_public, annee, include_photos
 * @access  Public
 */
router.get('/', albumController.getAlbums);

/**
 * @route   GET /albums/:id
 * @desc    Obtenir un album par son ID avec toutes ses photos
 * @access  Public
 */
router.get('/:id', albumController.getAlbumById);

/**
 * Routes admin pour gérer les albums
 * Nécessitent authentification et rôle admin
 */

/**
 * @route   POST /albums/admin
 * @desc    Créer un nouvel album
 * @body    titre, description, date_evenement, lieu_evenement, est_public, ordre
 * @file    image_couverture (optionnel)
 * @access  Private (Admin only)
 */
router.post(
  '/admin',
  authenticate,
  checkRole(['admin']),
  (req, res, next) => {
    uploadAlbum.single('image_couverture')(req, res, (err) => {
      if (err) {
        console.error('Erreur upload image de couverture:', err);
        
        let message = 'Erreur lors de l\'upload de l\'image';
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'L\'image est trop volumineuse. Taille maximale: 10 MB';
        } else if (err.message) {
          message = err.message;
        }
        
        return res.status(400).json({
          success: false,
          message: message
        });
      }
      next();
    });
  },
  albumController.createAlbum
);

/**
 * @route   PUT /albums/admin/:id
 * @desc    Mettre à jour un album
 * @body    titre, description, date_evenement, lieu_evenement, est_public, ordre
 * @file    image_couverture (optionnel)
 * @access  Private (Admin only)
 */
router.put(
  '/admin/:id',
  authenticate,
  checkRole(['admin']),
  (req, res, next) => {
    uploadAlbum.single('image_couverture')(req, res, (err) => {
      if (err) {
        console.error('Erreur upload image de couverture:', err);
        
        let message = 'Erreur lors de l\'upload de l\'image';
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'L\'image est trop volumineuse. Taille maximale: 10 MB';
        } else if (err.message) {
          message = err.message;
        }
        
        return res.status(400).json({
          success: false,
          message: message
        });
      }
      next();
    });
  },
  albumController.updateAlbum
);

/**
 * @route   DELETE /albums/admin/:id
 * @desc    Supprimer un album et toutes ses photos
 * @access  Private (Admin only)
 */
router.delete(
  '/admin/:id',
  authenticate,
  checkRole(['admin']),
  albumController.deleteAlbum
);

/**
 * @route   POST /albums/admin/:id/photos
 * @desc    Ajouter des photos à un album
 * @body    legendes (optionnel, tableau JSON de légendes)
 * @files   photos[] (multiple)
 * @access  Private (Admin only)
 */
router.post(
  '/admin/:id/photos',
  authenticate,
  checkRole(['admin']),
  (req, res, next) => {
    uploadAlbum.array('photos', 50)(req, res, (err) => {
      if (err) {
        console.error('Erreur upload photos:', err);
        
        let message = 'Erreur lors de l\'upload des photos';
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'Une ou plusieurs photos sont trop volumineuses. Taille maximale: 10 MB par photo';
        } else if (err.message) {
          message = err.message;
        }
        
        return res.status(400).json({
          success: false,
          message: message
        });
      }
      next();
    });
  },
  albumController.addPhotos
);

/**
 * @route   PUT /albums/admin/:id/photos/reorder
 * @desc    Réordonner les photos d'un album
 * @body    ordres: [{photo_id: number, ordre: number}, ...]
 * @access  Private (Admin only)
 */
router.put(
  '/admin/:id/photos/reorder',
  authenticate,
  checkRole(['admin']),
  albumController.reorderPhotos
);

/**
 * @route   PUT /albums/admin/photos/:photoId
 * @desc    Mettre à jour une photo (légende, ordre)
 * @body    legende, ordre
 * @access  Private (Admin only)
 */
router.put(
  '/admin/photos/:photoId',
  authenticate,
  checkRole(['admin']),
  albumController.updatePhoto
);

/**
 * @route   DELETE /albums/admin/photos/:photoId
 * @desc    Supprimer une photo
 * @access  Private (Admin only)
 */
router.delete(
  '/admin/photos/:photoId',
  authenticate,
  checkRole(['admin']),
  albumController.deletePhoto
);

module.exports = router;
