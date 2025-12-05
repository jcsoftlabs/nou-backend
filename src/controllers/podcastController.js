const podcastService = require('../services/podcastService');
const { createPodcastSchema, updatePodcastSchema } = require('../validators/podcastValidators');

/**
 * POST /podcasts - Créer un podcast
 */
const createPodcast = async (req, res) => {
  try {
    const { error, value } = createPodcastSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    const podcast = await podcastService.createPodcast(value, req.files, req.user, req);
    
    return res.status(201).json({
      success: true,
      message: 'Podcast créé avec succès',
      data: podcast
    });
  } catch (error) {
    console.error('Erreur lors de la création du podcast:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création du podcast'
    });
  }
};

/**
 * GET /podcasts - Liste paginée
 */
const getPodcasts = async (req, res) => {
  try {
    const { page, limit, est_en_direct } = req.query;
    
    const result = await podcastService.getPodcasts({
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
 * GET /podcasts/:id - Détail d'un podcast
 */
const getPodcastById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const podcast = await podcastService.getPodcastById(id);
    
    return res.status(200).json({
      success: true,
      message: 'Podcast récupéré avec succès',
      data: podcast
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du podcast:', error);
    return res.status(404).json({
      success: false,
      message: error.message || 'Podcast non trouvé'
    });
  }
};

/**
 * PUT /podcasts/:id - Mettre à jour un podcast
 */
const updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error, value } = updatePodcastSchema.validate(req.body, {
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    const podcast = await podcastService.updatePodcast(id, value, req.files, req.user, req);
    
    return res.status(200).json({
      success: true,
      message: 'Podcast mis à jour avec succès',
      data: podcast
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du podcast:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du podcast'
    });
  }
};

/**
 * DELETE /podcasts/:id - Supprimer un podcast
 */
const deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await podcastService.deletePodcast(id, req.user, req);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du podcast:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du podcast'
    });
  }
};

/**
 * POST /podcasts/live/start - Démarrer un live
 */
const startLive = async (req, res) => {
  try {
    const { id, url_live } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du podcast est requis'
      });
    }
    
    const podcast = await podcastService.startLive(id, url_live, req.user, req);
    
    return res.status(200).json({
      success: true,
      message: 'Live démarré avec succès',
      data: podcast
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du live:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du démarrage du live'
    });
  }
};

/**
 * POST /podcasts/live/stop - Arrêter un live
 */
const stopLive = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du podcast est requis'
      });
    }
    
    const podcast = await podcastService.stopLive(id, req.user, req);
    
    return res.status(200).json({
      success: true,
      message: 'Live arrêté avec succès',
      data: podcast
    });
  } catch (error) {
    console.error('Erreur lors de l\'arrêt du live:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'arrêt du live'
    });
  }
};

/**
 * POST /podcasts/:id/listen - Incrémenter le compteur d'écoutes
 */
const incrementListens = async (req, res) => {
  try {
    const { id } = req.params;
    
    const podcast = await podcastService.incrementListens(id);
    
    return res.status(200).json({
      success: true,
      message: 'Écoute enregistrée',
      data: {
        id: podcast.id,
        nombre_ecoutes: podcast.nombre_ecoutes
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des écoutes:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'enregistrement de l\'écoute'
    });
  }
};

module.exports = {
  createPodcast,
  getPodcasts,
  getPodcastById,
  updatePodcast,
  deletePodcast,
  startLive,
  stopLive,
  incrementListens
};
