const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authenticate = require('../middleware/auth');

/**
 * @route   GET /parrainage/stats
 * @desc    Obtenir les statistiques de parrainage du membre authentifié
 * @access  Private
 */
router.get('/stats',
  authenticate,
  referralController.getStats
);

/**
 * @route   GET /parrainage/filleuls
 * @desc    Obtenir la liste des filleuls du membre authentifié
 * @access  Private
 */
router.get('/filleuls',
  authenticate,
  referralController.getFilleulsForCurrentUser
);

module.exports = router;
