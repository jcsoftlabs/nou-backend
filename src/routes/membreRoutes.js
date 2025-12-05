const express = require('express');
const router = express.Router();
const membreController = require('../controllers/membreController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const uploadProfile = require('../config/multerProfile');

/**
 * @route   GET /membres/me
 * @desc    Obtenir son propre profil
 * @access  Private
 */
router.get('/me',
  authenticate,
  membreController.getOwnProfile
);

/**
 * @route   PUT /membres/me
 * @desc    Mettre à jour son propre profil
 * @access  Private
 */
router.put('/me',
  authenticate,
  membreController.updateOwnProfile
);

/**
 * @route   POST /membres/me/photo
 * @desc    Upload photo de profil
 * @access  Private
 */
router.post('/me/photo',
  authenticate,
  uploadProfile.single('photo'),
  membreController.uploadProfilePhoto
);

/**
 * @route   GET /membres/:id
 * @desc    Récupérer un membre par son ID
 * @access  Private
 */
router.get('/:id',
  authenticate,
  membreController.getMembre
);

/**
 * @route   POST /membres
 * @desc    Créer ou modifier un membre (admin seulement)
 * @access  Private (Admin only)
 */
router.post('/', 
  authenticate, 
  checkRole(['admin']), 
  membreController.createOrUpdateMembre
);

module.exports = router;
