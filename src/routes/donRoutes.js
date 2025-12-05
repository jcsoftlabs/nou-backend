const express = require('express');
const router = express.Router();
const donController = require('../controllers/donController');
const authenticate = require('../middleware/auth');
const uploadRecu = require('../config/multerDon');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @route   POST /dons
 * @desc    Créer un nouveau don avec upload de reçu optionnel
 * @body    montant, description (optionnel)
 * @file    recu (optionnel) - Image ou PDF
 * @access  Private (Membre authentifié)
 */
router.post('/', (req, res, next) => {
  uploadRecu.single('recu')(req, res, (err) => {
    if (err) {
      // Erreur multer (fichier invalide, trop grand, etc.)
      console.error('Erreur upload reçu:', err);
      
      let message = 'Erreur lors de l\'upload du reçu';
      
      // Messages spécifiques selon le type d'erreur
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'Le fichier est trop volumineux. Taille maximale: 5 MB';
      } else if (err.message) {
        message = err.message;
      }
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    // Pas d'erreur, continuer vers le contrôleur
    next();
  });
}, donController.createDon);

/**
 * @route   GET /dons/mes-dons
 * @desc    Obtenir tous les dons du membre connecté
 * @access  Private (Membre authentifié)
 */
router.get('/mes-dons', donController.getMesDons);

/**
 * @route   GET /dons/:id
 * @desc    Obtenir les détails d'un don spécifique
 * @access  Private (Membre authentifié - uniquement ses propres dons)
 */
router.get('/:id', donController.getDonById);

module.exports = router;
