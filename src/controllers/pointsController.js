const pointsService = require('../services/pointsService');

/**
 * GET /points/:membre_id
 * Obtenir les points totaux d'un membre
 */
const getMemberPoints = async (req, res) => {
  try {
    const { membre_id } = req.params;
    
    // Validation
    if (isNaN(membre_id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de membre invalide'
      });
    }
    
    // Appeler le service
    const result = await pointsService.calculateMemberPoints(parseInt(membre_id));
    
    return res.status(200).json({
      success: true,
      message: 'Points récupérés avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des points:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des points'
    });
  }
};

/**
 * GET /leaderboard
 * Obtenir le classement des membres par points
 */
const getLeaderboard = async (req, res) => {
  try {
    const { region, limit } = req.query;
    
    // Appeler le service
    const result = await pointsService.getLeaderboard({
      region,
      limit: limit || 50
    });
    
    return res.status(200).json({
      success: true,
      message: 'Leaderboard récupéré avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du leaderboard'
    });
  }
};

/**
 * GET /admin/config/points
 * Obtenir toutes les configurations de points (admin)
 */
const getPointsConfig = async (req, res) => {
  try {
    const configs = await pointsService.getAllPointsConfig();
    
    return res.status(200).json({
      success: true,
      message: 'Configurations récupérées avec succès',
      data: configs
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des configs:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des configurations'
    });
  }
};

/**
 * PUT /admin/config/points/:action_type
 * Mettre à jour la valeur des points pour une action (admin)
 */
const updatePointsConfig = async (req, res) => {
  try {
    const { action_type } = req.params;
    const { points_value } = req.body;
    
    // Validation
    if (!action_type) {
      return res.status(400).json({
        success: false,
        message: 'Le type d\'action est requis'
      });
    }
    
    if (points_value === undefined || isNaN(points_value) || points_value < 0) {
      return res.status(400).json({
        success: false,
        message: 'La valeur des points doit être un nombre positif'
      });
    }
    
    // Appeler le service
    const result = await pointsService.updatePointsConfig(
      action_type,
      parseInt(points_value),
      req.user,
      req
    );
    
    return res.status(200).json({
      success: true,
      message: 'Configuration mise à jour avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la config:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de la configuration'
    });
  }
};

module.exports = {
  getMemberPoints,
  getLeaderboard,
  getPointsConfig,
  updatePointsConfig
};
