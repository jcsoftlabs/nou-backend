const express = require('express');
const router = express.Router();
const fcmController = require('../controllers/fcmController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

/**
 * @route   POST /fcm/register
 * @desc    Enregistrer un token FCM pour recevoir les notifications
 * @access  Private (membre authentifié)
 */
router.post('/register',
  authenticate,
  fcmController.registerToken
);

/**
 * @route   DELETE /fcm/unregister
 * @desc    Désactiver un token FCM
 * @access  Private (membre authentifié)
 */
router.delete('/unregister',
  authenticate,
  fcmController.unregisterToken
);

/**
 * @route   POST /fcm/notify
 * @desc    Envoyer une notification personnalisée
 * @access  Private (Admin only)
 */
router.post('/notify',
  authenticate,
  checkRole(['admin']),
  fcmController.sendCustomNotification
);

/**
 * @route   GET /fcm/stats
 * @desc    Obtenir les statistiques des tokens FCM
 * @access  Private (Admin only)
 */
router.get('/stats',
  authenticate,
  checkRole(['admin']),
  fcmController.getStats
);

module.exports = router;
