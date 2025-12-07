const membreController = require('./membreController');

/**
 * PUT /admin/membres/:id - Mettre à jour un membre
 */
const updateMembre = async (req, res) => {
  try {
    // Injecter l'ID depuis les params dans le body
    req.body.id = req.params.id;
    // Réutiliser la logique de membreController
    return await membreController.createOrUpdateMembre(req, res);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour du membre",
    });
  }
};

/**
 * PUT /admin/membres/:id/status - Mettre à jour le statut d'un membre
 */
const updateMembreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut) {
      return res.status(400).json({
        success: false,
        message: 'Le statut est obligatoire'
      });
    }

    const membre = await adminService.updateMembreStatus(id, statut);

    return res.status(200).json({
      success: true,
      message: 'Statut du membre mis à jour avec succès',
      data: membre
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du statut'
    });
  }
};

const adminService = require('../services/adminService');
const cotisationService = require('../services/cotisationService');
const podcastService = require('../services/podcastService');
const formationService = require('../services/formationService');
const newsController = require('./newsController');
const annonceController = require('./annonceController');
const { Don, Membre } = require('../models');
// const fcmService = require('../services/fcmService'); // Désactivé temporairement

/**
 * GET /admin/stats - Statistiques globales
 */
const getStats = async (req, res) => {
  try {
    const stats = await adminService.getStats();
    
    return res.status(200).json({
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * GET /admin/stats/monthly - Statistiques mensuelles
 */
const getMonthlyStats = async (req, res) => {
  try {
    const stats = await adminService.getMonthlyStats();
    
    return res.status(200).json({
      success: true,
      message: 'Statistiques mensuelles récupérées avec succès',
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques mensuelles:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques mensuelles'
    });
  }
};

/**
 * GET /admin/stats/departments - Statistiques par département
 */
const getDepartmentStats = async (req, res) => {
  try {
    const stats = await adminService.getDepartmentStats();
    
    return res.status(200).json({
      success: true,
      message: 'Statistiques par département récupérées avec succès',
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques par département:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques par département'
    });
  }
};

/**
 * GET /admin/statuts - Liste des statuts disponibles
 */
const getStatuts = async (req, res) => {
  try {
    const statuts = [
      'Membre pré-adhérent',
      'Membre adhérent',
      'Membre spécial',
      'Chef d\'\u00e9quipe',
      'Dirigeant',
      'Leader',
      'Dirigeant national',
      'Dirigeant départemental',
      'Dirigeant communal',
      'Dirigeant section communale'
    ];
    
    return res.status(200).json({
      success: true,
      message: 'Statuts récupérés avec succès',
      data: statuts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statuts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statuts'
    });
  }
};

/**
 * GET /admin/membres - Liste des membres avec filtres
 */
const getMembres = async (req, res) => {
  try {
const { page, limit, search, role, departement, statuts } = req.query;
    
    const result = await adminService.getMembres({
      page,
      limit,
      search,
      role,
      departement,
      statuts
    });
    
    return res.status(200).json({
      success: true,
      message: 'Membres récupérés avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des membres'
    });
  }
};

/**
 * GET /admin/membres/:id - Obtenir un membre par son ID
 */
const getMembreById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const membre = await Membre.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'otp_code', 'otp_expires_at'] }
    });
    
    if (!membre) {
      return res.status(404).json({
        success: false,
        message: 'Membre introuvable'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Membre récupéré avec succès',
      data: membre
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du membre'
    });
  }
};

/**
 * GET /admin/cotisations - Liste des cotisations avec filtres
 */
const getCotisations = async (req, res) => {
  try {
    const { page, limit, statut, date_debut, date_fin, membre_id } = req.query;
    
    const result = await adminService.getCotisations({
      page,
      limit,
      statut,
      date_debut,
      date_fin,
      membre_id
    });
    
    return res.status(200).json({
      success: true,
      message: 'Cotisations récupérées avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cotisations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des cotisations'
    });
  }
};

/**
 * PUT /admin/cotisations/:id/valider - Valider une cotisation
 */
const validerCotisation = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire } = req.body;
    
    const cotisation = await cotisationService.validateCotisation(
      id,
      req.user.id,
      commentaire
    );
    
    return res.status(200).json({
      success: true,
      message: 'Cotisation validée avec succès',
      data: cotisation
    });
  } catch (error) {
    console.error('Erreur lors de la validation de la cotisation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la validation de la cotisation'
    });
  }
};

/**
 * GET /admin/podcasts - Liste des podcasts
 */
const getPodcasts = async (req, res) => {
  try {
    const { page, limit, est_en_direct } = req.query;
    
    const result = await adminService.getPodcasts({
      page,
      limit,
      est_en_direct
    });
    
    return res.status(200).json({
      success: true,
      message: 'Podcasts récupérés avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des podcasts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des podcasts'
    });
  }
};

/**
 * POST /admin/podcasts/upload - Upload d'un podcast
 * Note: Utilise le contrôleur existant de podcastController
 */
const uploadPodcast = async (req, res) => {
  try {
    const podcastController = require('./podcastController');
    return await podcastController.createPodcast(req, res);
  } catch (error) {
    console.error('Erreur lors de l\'upload du podcast:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'upload du podcast'
    });
  }
};

/**
 * DELETE /admin/podcasts/:id - Supprimer un podcast
 */
const deletePodcast = async (req, res) => {
  try {
    const podcastController = require('./podcastController');
    return await podcastController.deletePodcast(req, res);
  } catch (error) {
    console.error('Erreur lors de la suppression du podcast:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du podcast'
    });
  }
};

/**
 * GET /admin/quiz - Liste des quiz
 */
const getQuiz = async (req, res) => {
  try {
    const { page, limit, actif } = req.query;
    
    const result = await adminService.getQuiz({
      page,
      limit,
      actif
    });
    
    return res.status(200).json({
      success: true,
      message: 'Quiz récupérés avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des quiz:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des quiz'
    });
  }
};

/**
 * POST /admin/notifications/send - Envoyer notification personnalisée
 */
const sendNotification = async (req, res) => {
  try {
    const fcmController = require('./fcmController');
    return await fcmController.sendCustomNotification(req, res);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'envoi de la notification'
    });
  }
};

/**
 * GET /admin/auditlogs - Logs d'audit
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, action_type, user_id, date_debut, date_fin } = req.query;
    
    const result = await adminService.getAuditLogs({
      page,
      limit,
      action_type,
      user_id,
      date_debut,
      date_fin
    });
    
    return res.status(200).json({
      success: true,
      message: 'Logs d\'audit récupérés avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des logs d\'audit'
    });
  }
};

/**
 * GET /admin/formations - Liste des formations
 */
const getFormations = async (req, res) => {
  try {
    const { page, limit, est_active } = req.query;

    const result = await formationService.adminGetFormations({
      page,
      limit,
      est_active
    });

    return res.status(200).json({
      success: true,
      message: 'Formations récupérées avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des formations'
    });
  }
};

/**
 * POST /admin/formations - Créer une formation
 */
const createFormation = async (req, res) => {
  try {
    const formation = await formationService.adminCreateFormation(req.body);

    return res.status(201).json({
      success: true,
      message: 'Formation créée avec succès',
      data: formation
    });
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la formation'
    });
  }
};

/**
 * PUT /admin/formations/:id - Mettre à jour une formation
 */
const updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const formation = await formationService.adminUpdateFormation(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Formation mise à jour avec succès',
      data: formation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de la formation'
    });
  }
};

/**
 * POST /admin/formations/:id/modules - Créer un module pour une formation
 */
const createModule = async (req, res) => {
  try {
    const { id } = req.params; // id de la formation
    const moduleFormation = await formationService.adminCreateModule(id, req.body, req.files);

    return res.status(201).json({
      success: true,
      message: 'Module de formation créé avec succès',
      data: moduleFormation
    });
  } catch (error) {
    console.error('Erreur lors de la création du module de formation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création du module de formation'
    });
  }
};

/**
 * PUT /admin/modules/:id - Mettre à jour un module de formation
 */
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const moduleFormation = await formationService.adminUpdateModule(id, req.body, req.files);

    return res.status(200).json({
      success: true,
      message: 'Module de formation mis à jour avec succès',
      data: moduleFormation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du module de formation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du module de formation'
    });
  }
};

/**
 * GET /admin/dons - Liste des dons avec filtres
 */
const getDons = async (req, res) => {
  try {
    const { page = 1, limit = 50, statut, membre_id } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (statut) {
      whereClause.statut_don = statut;
    }
    if (membre_id) {
      whereClause.membre_id = membre_id;
    }
    
    const { count, rows } = await Don.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Membre,
          as: 'membre',
          attributes: ['id', 'nom', 'prenom', 'email', 'telephone_principal']
        },
        {
          model: Membre,
          as: 'admin_verificateur',
          attributes: ['id', 'nom', 'prenom'],
          required: false
        }
      ],
      order: [['date_don', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return res.status(200).json({
      success: true,
      message: 'Dons récupérés avec succès',
      data: {
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dons:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des dons'
    });
  }
};

/**
 * PUT /admin/dons/:id/approuver - Approuver un don
 */
const approuverDon = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire } = req.body;
    const admin_id = req.user.id;
    
    const don = await Don.findByPk(id);
    
    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Don introuvable'
      });
    }
    
    if (don.statut_don !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: `Ce don a déjà été ${don.statut_don === 'approuve' ? 'approuvé' : 'rejeté'}`
      });
    }
    
    don.statut_don = 'approuve';
    don.admin_verificateur_id = admin_id;
    don.date_verification = new Date();
    don.commentaire_verification = commentaire || null;
    
    await don.save();
    
    // Recharger avec les relations
    const donUpdated = await Don.findByPk(id, {
      include: [
        {
          model: Membre,
          as: 'membre',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Membre,
          as: 'admin_verificateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Don approuvé avec succès',
      data: donUpdated
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation du don:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'approbation du don'
    });
  }
};

/**
 * PUT /admin/dons/:id/rejeter - Rejeter un don
 */
const rejeterDon = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire } = req.body;
    const admin_id = req.user.id;
    
    const don = await Don.findByPk(id);
    
    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Don introuvable'
      });
    }
    
    if (don.statut_don !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: `Ce don a déjà été ${don.statut_don === 'approuve' ? 'approuvé' : 'rejeté'}`
      });
    }
    
    don.statut_don = 'rejete';
    don.admin_verificateur_id = admin_id;
    don.date_verification = new Date();
    don.commentaire_verification = commentaire || 'Don rejeté par l\'administrateur';
    
    await don.save();
    
    // Recharger avec les relations
    const donUpdated = await Don.findByPk(id, {
      include: [
        {
          model: Membre,
          as: 'membre',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Membre,
          as: 'admin_verificateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Don rejeté',
      data: donUpdated
    });
  } catch (error) {
    console.error('Erreur lors du rejet du don:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du rejet du don'
    });
  }
};

/**
 * POST /admin/modules/attach-quiz - Associer un quiz à un module
 */
const attachQuizToModule = async (req, res) => {
  try {
    const { quizId, moduleId } = req.body;

    if (!quizId || !moduleId) {
      return res.status(400).json({
        success: false,
        message: 'quizId et moduleId sont obligatoires'
      });
    }

    const quiz = await formationService.adminAttachQuizToModule(quizId, moduleId);

    return res.status(200).json({
      success: true,
      message: 'Quiz associé au module avec succès',
      data: quiz
    });
  } catch (error) {
    console.error('Erreur lors de l\'association du quiz au module:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'association du quiz au module'
    });
  }
};

/**
 * DELETE /admin/formations/:id - Supprimer une formation
 */
const deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await formationService.adminDeleteFormation(id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation:", error);
    return res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression de la formation' });
  }
};

/**
 * DELETE /admin/quiz/:id - Supprimer un quiz
 */
const deleteQuiz = async (req, res) => {
  try {
    const { Quiz } = require('../models');
    const { id } = req.params;
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }
    await quiz.destroy();
    return res.status(200).json({ success: true, message: 'Quiz supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du quiz:', error);
    return res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression du quiz' });
  }
};

/**
 * PUT /admin/membres/:id/rating - Mettre à jour la note (0..5)
 * Règle: seule une augmentation est autorisée côté API.
 */
const updateMembreRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, note } = req.body;
    if (typeof rating === 'undefined') {
      return res.status(400).json({ success: false, message: 'rating est requis (0..5)' });
    }
    const { Membre, AuditLog } = require('../models');
    const membre = await Membre.findByPk(id);
    if (!membre) {
      return res.status(404).json({ success: false, message: 'Membre introuvable' });
    }
    const newRating = Math.min(5, Math.max(0, parseInt(rating, 10)));
    if (newRating < (membre.rating || 0)) {
      return res.status(400).json({ success: false, message: 'La note ne peut pas être diminuée par l\'API' });
    }
    const before = membre.toJSON();
    await membre.update({ rating: newRating, dernier_update: new Date() });

    // Audit log (best effort)
    try {
      if (AuditLog) {
        await AuditLog.create({
          user_id: req.user?.id,
          action_type: 'UPDATE_RATING',
          target_type: 'membre',
          target_id: membre.id,
          data_before: { rating: before.rating },
          data_after: { rating: newRating, note: note || null },
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        });
      }
    } catch (e) {
      console.error('Audit log rating error:', e);
    }

    return res.status(200).json({ success: true, message: 'Note mise à jour', data: { id: membre.id, rating: membre.rating } });
  } catch (error) {
    console.error('Erreur update rating:', error);
    return res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour de la note' });
  }
};

module.exports = {
  // News (admin) déléguées au newsController
  adminGetNewsList: newsController.adminGetNewsList,
  adminCreateNews: newsController.adminCreateNews,
  adminUpdateNews: newsController.adminUpdateNews,
  adminDeleteNews: newsController.adminDeleteNews,
  adminPublishNews: newsController.adminPublishNews,
  adminUnpublishNews: newsController.adminUnpublishNews,

  // Annonces (admin) déléguées à annonceController
  adminGetAnnonces: annonceController.adminGetAnnonces,
  adminCreateAnnonce: annonceController.adminCreateAnnonce,
  adminUpdateAnnonce: annonceController.adminUpdateAnnonce,
  adminChangeAnnonceStatus: annonceController.adminChangeAnnonceStatus,
  getStats,
  getMonthlyStats,
  getDepartmentStats,
  getStatuts,
  getMembres,
  getMembreById,
  getCotisations,
  validerCotisation,
  getPodcasts,
  uploadPodcast,
  deletePodcast,
  getQuiz,
  sendNotification,
  getAuditLogs,
  getFormations,
  createFormation,
  updateFormation,
  createModule,
  updateModule,
  updateMembre,
  updateMembreStatus,
  attachQuizToModule,
  getDons,
  approuverDon,
  rejeterDon,
  deleteFormation,
  deleteQuiz,
  updateMembreRating
};
