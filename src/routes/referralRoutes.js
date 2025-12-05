const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

/**
 * @route   GET /referrals/:parrain_id
 * @desc    Obtenir la liste des filleuls et points cumulés d'un parrain
 * @access  Public ou Authentifié (selon besoin)
 */
router.get('/:parrain_id', referralController.getFilleuls);

/**
 * @route   PUT /referrals/:id/adjust-points
 * @desc    Ajuster manuellement les points d'un referral
 * @access  Private (Admin only)
 */
router.put('/:id/adjust-points',
  authenticate,
  checkRole(['admin']),
  referralController.adjustPoints
);

module.exports = router;
