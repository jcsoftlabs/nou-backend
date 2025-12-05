const referralService = require('../services/referralService');

/**
 * GET /referrals/:parrain_id
 * Obtenir la liste des filleuls et points cumulés d'un parrain
 */
const getFilleuls = async (req, res) => {
  try {
    const { parrain_id } = req.params;
    
    // Vérifier que parrain_id est un nombre valide
    if (isNaN(parrain_id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de parrain invalide'
      });
    }
    
    // Appeler le service
    const result = await referralService.getFilleulsByParrain(parseInt(parrain_id));
    
    return res.status(200).json({
      success: true,
      message: 'Liste des filleuls récupérée avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des filleuls:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des filleuls'
    });
  }
};

/**
 * PUT /referrals/:id/adjust-points
 * Ajuster manuellement les points d'un referral (admin)
 */
const adjustPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points, raison } = req.body;
    
    // Validation
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de referral invalide'
      });
    }
    
    if (points === undefined || isNaN(points) || points < 0) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de points invalide'
      });
    }
    
    if (!raison) {
      return res.status(400).json({
        success: false,
        message: 'Une raison est requise pour l\'ajustement'
      });
    }
    
    // Appeler le service
    const result = await referralService.adjustPoints(
      parseInt(id),
      parseInt(points),
      req.user,
      raison,
      req
    );
    
    return res.status(200).json({
      success: true,
      message: 'Points ajustés avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'ajustement des points:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'ajustement des points'
    });
  }
};

/**
 * GET /parrainage/stats
 * Obtenir les statistiques de parrainage pour le membre authentifié
 */
const getStats = async (req, res) => {
  try {
    const membreId = req.user.id;
    
    const stats = await referralService.getFilleulsByParrain(membreId);
    
    return res.status(200).json({
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: stats
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des stats'
    });
  }
};

/**
 * GET /parrainage/filleuls
 * Obtenir la liste des filleuls du membre authentifié
 */
const getFilleulsForCurrentUser = async (req, res) => {
  try {
    const membreId = req.user.id;
    
    const result = await referralService.getFilleulsByParrain(membreId);
    
    return res.status(200).json({
      success: true,
      message: 'Liste des filleuls récupérée avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des filleuls:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des filleuls'
    });
  }
};

module.exports = {
  getFilleuls,
  getStats,
  getFilleulsForCurrentUser,
  adjustPoints
};
