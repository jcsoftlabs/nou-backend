const express = require('express');
const router = express.Router();
const cotisationController = require('../controllers/cotisationController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const upload = require('../config/multer');
const { paymentLimiter, adminValidationLimiter } = require('../middleware/rateLimiter');

/**
 * @route   GET /cotisations/last/:membreId
 * @desc    Récupérer la dernière cotisation d'un membre
 * @access  Private
 */
router.get('/last/:membreId',
  authenticate,
  cotisationController.getLastCotisation
);

/**
 * @route   GET /cotisations
 * @desc    Récupérer les cotisations (avec filtres optionnels)
 * @access  Private
 */
router.get('/',
  authenticate,
  cotisationController.getCotisations
);

/**
 * @route   GET /cotisations/mon-statut
 * @desc    Obtenir le statut de cotisation de l'année en cours
 * @access  Private (Membre authentifié)
 */
router.get('/mon-statut',
  authenticate,
  cotisationController.getMonStatutCotisation
);

/**
 * @route   POST /cotisations
 * @desc    Créer une nouvelle cotisation
 * @access  Public (ou authentifié selon besoin)
 */
router.post('/', 
  paymentLimiter, // Rate limiting: 10 req/15min
  (req, res, next) => {
    upload.single('recu')(req, res, (err) => {
      if (err) {
        // Erreur multer (fichier invalide, trop grand, etc.)
        console.error('Erreur upload reçu cotisation:', err);
        
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
  },
  cotisationController.createCotisation
);

/**
 * @route   PUT /cotisations/:id/valider
 * @desc    Valider une cotisation
 * @access  Private (Admin only)
 */
router.put('/:id/valider',
  adminValidationLimiter, // Rate limiting: 30 req/10min
  authenticate,
  checkRole(['admin']),
  cotisationController.validerCotisation
);

/**
 * @route   PUT /cotisations/:id/rejeter
 * @desc    Rejeter une cotisation
 * @access  Private (Admin only)
 */
router.put('/:id/rejeter',
  adminValidationLimiter, // Rate limiting: 30 req/10min
  authenticate,
  checkRole(['admin']),
  cotisationController.rejeterCotisation
);

module.exports = router;
