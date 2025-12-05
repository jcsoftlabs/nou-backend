const formationService = require('../services/formationService');

/**
 * GET /formations
 * Récupérer toutes les formations actives avec leurs modules et quiz
 */
const getFormations = async (req, res) => {
  try {
    const membreId = req.user?.id || null;
    const formations = await formationService.getFormationsForUser(membreId);

    return res.status(200).json({
      success: true,
      message: 'Formations récupérées avec succès',
      data: { formations }
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
 * GET /formations/:id
 * Récupérer une formation avec ses modules et quiz
 */
const getFormationById = async (req, res) => {
  try {
    const { id } = req.params;
    const membreId = req.user?.id || null;
    const formation = await formationService.getFormationByIdForUser(id, membreId);

    return res.status(200).json({
      success: true,
      message: 'Formation récupérée avec succès',
      data: formation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    return res.status(404).json({
      success: false,
      message: error.message || 'Formation non trouvée'
    });
  }
};

module.exports = {
  getFormations,
  getFormationById
};
