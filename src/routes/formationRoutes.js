const express = require('express');
const router = express.Router();
const formationController = require('../controllers/formationController');
const authenticate = require('../middleware/auth');

/**
 * @route   GET /formations
 * @desc    Récupérer toutes les formations actives avec leurs modules et quiz
 * @access  Private (membre authentifié)
 */
router.get('/',
  authenticate,
  formationController.getFormations
);

/**
 * @route   GET /formations/:id
 * @desc    Récupérer une formation avec ses modules et quiz
 * @access  Private (membre authentifié)
 */
router.get('/:id',
  authenticate,
  formationController.getFormationById
);

module.exports = router;
