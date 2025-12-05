const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

/**
 * @route   GET /leaderboard
 * @desc    Obtenir le classement des membres par points
 * @access  Public
 * @query   region (optionnel) - Filtrer par département
 * @query   limit (optionnel) - Nombre de résultats (défaut: 50)
 */
router.get('/leaderboard', pointsController.getLeaderboard);

/**
 * @route   GET /admin/config
 * @desc    Obtenir toutes les configurations de points
 * @access  Private (Admin only)
 */
router.get('/admin/config',
  authenticate,
  checkRole(['admin']),
  pointsController.getPointsConfig
);

/**
 * @route   PUT /admin/config/:action_type
 * @desc    Mettre à jour la valeur des points pour une action
 * @access  Private (Admin only)
 */
router.put('/admin/config/:action_type',
  authenticate,
  checkRole(['admin']),
  pointsController.updatePointsConfig
);

/**
 * @route   GET /points/:membre_id
 * @desc    Obtenir les points totaux d'un membre
 * @access  Public
 */
router.get('/:membre_id', pointsController.getMemberPoints);

module.exports = router;
