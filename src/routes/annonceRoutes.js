const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');

// Annonces actives
router.get('/', annonceController.getPublicAnnonces);

module.exports = router;
