
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const uploadPodcast = require('../config/multerPodcast');
const uploadNewsCover = require('../config/multerNews');

// Middleware : tous les endpoints /admin nécessitent auth + rôle admin
router.use(authenticate);
router.use(checkRole(['admin']));

/**
 * @route   GET /admin/stats
 * @desc    Obtenir les statistiques globales du système
 * @access  Private (Admin only)
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /admin/stats/monthly
 * @desc    Obtenir les statistiques mensuelles (6 derniers mois)
 * @access  Private (Admin only)
 */
router.get('/stats/monthly', adminController.getMonthlyStats);

/**
 * @route   GET /admin/stats/departments
 * @desc    Obtenir les statistiques par département
 * @access  Private (Admin only)
 */
router.get('/stats/departments', adminController.getDepartmentStats);

/**
 * @route   GET /admin/statuts
 * @desc    Obtenir la liste des statuts disponibles
 * @access  Private (Admin only)
 */
router.get('/statuts', adminController.getStatuts);

/**
 * @route   GET /admin/membres
 * @desc    Obtenir la liste des membres avec filtres
 * @query   page, limit, search, role, departement, statuts
 * @access  Private (Admin only)
 */
router.get('/membres', adminController.getMembres);

/**
 * @route   GET /admin/membres/:id
 * @desc    Obtenir un membre par son ID
 * @access  Private (Admin only)
 */
router.get('/membres/:id', adminController.getMembreById);

/**
 * @route   PUT /admin/membres/:id
 * @desc    Mettre à jour un membre
 * @access  Private (Admin only)
 */
router.put('/membres/:id', adminController.updateMembre);

/**
 * @route   PUT /admin/membres/:id/status
 * @desc    Mettre à jour le statut d'un membre
 * @body    statut
 * @access  Private (Admin only)
 */
router.put('/membres/:id/status', adminController.updateMembreStatus);

/**
 * @route   GET /admin/cotisations
 * @desc    Obtenir la liste des cotisations avec filtres
 * @query   page, limit, statut, date_debut, date_fin, membre_id
 * @access  Private (Admin only)
 */
router.get('/cotisations', adminController.getCotisations);

/**
 * @route   PUT /admin/cotisations/:id/valider
 * @desc    Valider une cotisation
 * @body    commentaire (optionnel)
 * @access  Private (Admin only)
 */
router.put('/cotisations/:id/valider', adminController.validerCotisation);

/**
 * @route   GET /admin/podcasts
 * @desc    Obtenir la liste des podcasts
 * @query   page, limit, est_en_direct
 * @access  Private (Admin only)
 */
router.get('/podcasts', adminController.getPodcasts);

/**
 * @route   POST /admin/podcasts/upload
 * @desc    Upload un nouveau podcast
 * @body    titre, description, date_publication, categorie, duree
 * @files   audio (fichier audio), cover (image couverture)
 * @access  Private (Admin only)
 */
router.post('/podcasts/upload',
  (req, res, next) => {
    uploadPodcast.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        console.error('Erreur upload podcast (admin):', err);
        
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
  adminController.uploadPodcast
);

/**
 * @route   DELETE /admin/podcasts/:id
 * @desc    Supprimer un podcast
 * @access  Private (Admin only)
 */
router.delete('/podcasts/:id', adminController.deletePodcast);

/**
 * @route   GET /admin/quiz
 * @desc    Obtenir la liste des quiz
 * @query   page, limit, actif
 * @access  Private (Admin only)
 */
router.get('/quiz', adminController.getQuiz);

/**
 * @route   GET /admin/formations
 * @desc    Obtenir la liste des formations
 * @query   page, limit, est_active
 * @access  Private (Admin only)
 */
router.get('/formations', adminController.getFormations);

/**
 * @route   POST /admin/formations
 * @desc    Créer une nouvelle formation
 * @body    titre, description, niveau, image_couverture_url, est_active, date_publication
 * @access  Private (Admin only)
 */
router.post('/formations', adminController.createFormation);

/**
 * @route   PUT /admin/formations/:id
 * @desc    Mettre à jour une formation existante
 * @access  Private (Admin only)
 */
router.put('/formations/:id', adminController.updateFormation);

/**
 * @route   POST /admin/formations/:id/modules
 * @desc    Créer un module pour une formation
 * @body    titre, description, ordre, type_contenu, contenu_texte, image_url, video_url
 * @access  Private (Admin only)
 */
router.post('/formations/:id/modules', adminController.createModule);

/**
 * @route   PUT /admin/modules/:id
 * @desc    Mettre à jour un module de formation (contenu, ordre, etc.)
 * @access  Private (Admin only)
 */
router.put('/modules/:id', adminController.updateModule);

/**
 * @route   POST /admin/modules/attach-quiz
 * @desc    Associer un quiz existant à un module
 * @body    quizId, moduleId
 * @access  Private (Admin only)
 */
router.post('/modules/attach-quiz', adminController.attachQuizToModule);

/**
 * @route   POST /admin/notifications/send
 * @desc    Envoyer une notification push personnalisée
 * @body    title, body, target_type, target_ids, data
 * @access  Private (Admin only)
 */
router.post('/notifications/send', adminController.sendNotification);

/**
 * @route   GET /admin/auditlogs
 * @desc    Obtenir les logs d'audit
 * @query   page, limit, action_type, user_id, date_debut, date_fin
 * @access  Private (Admin only)
 */
router.get('/auditlogs', adminController.getAuditLogs);

/**
 * @route   GET /admin/dons
 * @desc    Obtenir la liste des dons avec filtres
 * @query   page, limit, statut, membre_id
 * @access  Private (Admin only)
 */
router.get('/dons', adminController.getDons);

/**
 * @route   PUT /admin/dons/:id/approuver
 * @desc    Approuver un don
 * @body    commentaire (optionnel)
 * @access  Private (Admin only)
 */
router.put('/dons/:id/approuver', adminController.approuverDon);

/**
 * @route   PUT /admin/dons/:id/rejeter
 * @desc    Rejeter un don
 * @body    commentaire (obligatoire)
 * @access  Private (Admin only)
 */
router.put('/dons/:id/rejeter', adminController.rejeterDon);

/**
 * @route   GET /admin/news
 * @desc    Obtenir la liste des articles de news (tous statuts)
 * @access  Private (Admin only)
 */
router.get('/news', adminController.adminGetNewsList);

/**
 * @route   POST /admin/news
 * @desc    Créer un article de news (avec image de couverture optionnelle)
 * @access  Private (Admin only)
 */
router.post(
  '/news',
  (req, res, next) => {
    uploadNewsCover.single('cover')(req, res, (err) => {
      if (err) {
        console.error('Erreur upload cover news (admin):', err);

        let message = "Erreur lors de l'upload de l'image de couverture";
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'Image trop volumineuse (max 5MB)';
        } else if (err.message) {
          message = err.message;
        }

        return res.status(400).json({
          success: false,
          message
        });
      }
      next();
    });
  },
  adminController.adminCreateNews
);

/**
 * @route   PUT /admin/news/:id
 * @desc    Mettre à jour un article de news
 * @access  Private (Admin only)
 */
router.put('/news/:id', adminController.adminUpdateNews);

/**
 * @route   DELETE /admin/news/:id
 * @desc    Supprimer (soft delete) un article de news
 * @access  Private (Admin only)
 */
router.delete('/news/:id', adminController.adminDeleteNews);

/**
 * @route   PUT /admin/news/:id/publish
 * @desc    Publier un article de news
 * @access  Private (Admin only)
 */
router.put('/news/:id/publish', adminController.adminPublishNews);

/**
 * @route   PUT /admin/news/:id/unpublish
 * @desc    Dépublier un article de news
 * @access  Private (Admin only)
 */
router.put('/news/:id/unpublish', adminController.adminUnpublishNews);

/**
 * @route   GET /admin/annonces
 * @desc    Obtenir la liste des annonces
 * @access  Private (Admin only)
 */
router.get('/annonces', adminController.adminGetAnnonces);

/**
 * @route   POST /admin/annonces
 * @desc    Créer une annonce
 * @access  Private (Admin only)
 */
router.post('/annonces', adminController.adminCreateAnnonce);

/**
 * @route   PUT /admin/annonces/:id
 * @desc    Mettre à jour une annonce
 * @access  Private (Admin only)
 */
router.put('/annonces/:id', adminController.adminUpdateAnnonce);

/**
 * @route   PUT /admin/annonces/:id/status
 * @desc    Changer le statut d'une annonce
 * @access  Private (Admin only)
 */
router.put('/annonces/:id/status', adminController.adminChangeAnnonceStatus);

module.exports = router;
