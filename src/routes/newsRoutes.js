const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Liste des articles publiés
router.get('/', newsController.getPublicNewsList);

// Détail par slug ou id
router.get('/:slugOrId', newsController.getPublicNewsDetail);

module.exports = router;
