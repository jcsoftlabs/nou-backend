const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcastController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const uploadPodcast = require('../config/multerPodcast');

/**
 * @route   GET /podcasts
 * @desc    Obtenir la liste paginée des podcasts
 * @access  Public
 * @query   page, limit, est_en_direct
 */
router.get('/', podcastController.getPodcasts);

/**
 * @route   GET /podcasts/:id
 * @desc    Obtenir le détail d'un podcast
 * @access  Public
 */
router.get('/:id', podcastController.getPodcastById);

/**
 * @route   POST /podcasts/:id/listen
 * @desc    Incrémenter le compteur d'écoutes
 * @access  Public
 */
router.post('/:id/listen', podcastController.incrementListens);

/**
 * @route   POST /podcasts
 * @desc    Créer un nouveau podcast
 * @access  Private (Admin only)
 */
router.post('/',
  authenticate,
  checkRole(['admin']),
  (req, res, next) => {
    uploadPodcast.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        console.error('Erreur upload podcast:', err);
        
        let message = 'Erreur lors de l\'upload des fichiers';
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'Un ou plusieurs fichiers sont trop volumineux. Taille maximale: 50 MB pour audio, 5 MB pour cover';
        } else if (err.message) {
          message = err.message;
        }
        
        return res.status(400).json({
          success: false,
          message: message
        });
      }
      next();
    });
  },
  podcastController.createPodcast
);

/**
 * @route   PUT /podcasts/:id
 * @desc    Mettre à jour un podcast
 * @access  Private (Admin only)
 */
router.put('/:id',
  authenticate,
  checkRole(['admin']),
  (req, res, next) => {
    uploadPodcast.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        console.error('Erreur upload podcast update:', err);
        
        let message = 'Erreur lors de l\'upload des fichiers';
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'Un ou plusieurs fichiers sont trop volumineux. Taille maximale: 50 MB pour audio, 5 MB pour cover';
        } else if (err.message) {
          message = err.message;
        }
        
        return res.status(400).json({
          success: false,
          message: message
        });
      }
      next();
    });
  },
  podcastController.updatePodcast
);

/**
 * @route   DELETE /podcasts/:id
 * @desc    Supprimer un podcast
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticate,
  checkRole(['admin']),
  podcastController.deletePodcast
);

/**
 * @route   POST /podcasts/live/start
 * @desc    Démarrer un live
 * @access  Private (Admin only)
 */
router.post('/live/start',
  authenticate,
  checkRole(['admin']),
  podcastController.startLive
);

/**
 * @route   POST /podcasts/live/stop
 * @desc    Arrêter un live
 * @access  Private (Admin only)
 */
router.post('/live/stop',
  authenticate,
  checkRole(['admin']),
  podcastController.stopLive
);

module.exports = router;
