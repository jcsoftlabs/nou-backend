const { Referral, Membre, ConfigPoints, AuditLog } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Obtenir ou créer la configuration des points
 */
const getPointsConfig = async (actionType) => {
  try {
    let config = await ConfigPoints.findOne({ where: { action_type: actionType } });
    
    if (!config) {
      // Créer la config par défaut si elle n'existe pas
      const defaults = {
        'referral_base': { points: 10, description: 'Points attribués à l\'inscription d\'un filleul' },
        'referral_payment': { points: 5, description: 'Bonus quand un filleul paie sa cotisation' }
      };
      
      const def = defaults[actionType] || { points: 0, description: actionType };
      
      config = await ConfigPoints.create({
        action_type: actionType,
        points_value: def.points,
        description: def.description,
        active: true
      });
    }
    
    return config;
  } catch (error) {
    console.error('Erreur lors de la récupération de la config:', error);
    // Retour par défaut en cas d'erreur
    return {
      action_type: actionType,
      points_value: actionType === 'referral_base' ? 10 : 5,
      active: true
    };
  }
};

/**
 * Calculer les points totaux d'un membre
 */
const calculateMemberPoints = async (membreId) => {
  try {
    // Vérifier que le membre existe
    const membre = await Membre.findByPk(membreId, {
      attributes: ['id', 'nom', 'prenom', 'code_adhesion', 'departement']
    });
    
    if (!membre) {
      throw new Error('Membre non trouvé');
    }
    
    // Calculer les points en tant que parrain
    const referralsAsParrain = await Referral.findAll({
      where: { parrain_id: membreId },
      attributes: ['points_attribues']
    });
    
    const pointsParrainage = referralsAsParrain.reduce(
      (sum, ref) => sum + ref.points_attribues,
      0
    );
    
    // TODO: Ajouter d'autres sources de points (quiz, événements, etc.)
    const pointsQuiz = 0;
    const pointsEvenements = 0;
    
    const pointsTotal = pointsParrainage + pointsQuiz + pointsEvenements;
    
    return {
      membre: membre.toJSON(),
      points: {
        total: pointsTotal,
        parrainage: pointsParrainage,
        quiz: pointsQuiz,
        evenements: pointsEvenements
      },
      details: {
        nombre_filleuls: referralsAsParrain.length,
        referrals: referralsAsParrain.map(r => ({
          points: r.points_attribues
        }))
      }
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtenir le leaderboard des membres par points
 */
const getLeaderboard = async (options = {}) => {
  try {
    const { region, limit = 50 } = options;
    
    // Requête SQL pour calculer les points totaux de chaque membre
    let whereClause = {};
    
    if (region) {
      whereClause.departement = region;
    }
    
    // Sous-requête pour calculer les points de parrainage
    const membresWithPoints = await Membre.findAll({
      where: whereClause,
      attributes: [
        'id',
        'nom',
        'prenom',
        'code_adhesion',
        'departement',
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(points_attribues), 0)
            FROM referrals
            WHERE referrals.parrain_id = Membre.id
          )`),
          'points_total'
        ]
      ],
      order: [[sequelize.literal('points_total'), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });
    
    // Formater les résultats avec rang
    const leaderboard = membresWithPoints.map((membre, index) => ({
      rang: index + 1,
      membre: {
        id: membre.id,
        nom: membre.nom,
        prenom: membre.prenom,
        code_adhesion: membre.code_adhesion,
        departement: membre.departement
      },
      points_total: parseInt(membre.points_total) || 0
    }));
    
    return {
      leaderboard,
      filters: {
        region: region || 'global',
        limit: parseInt(limit)
      },
      total_membres: leaderboard.length
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Mettre à jour la configuration des points (admin)
 */
const updatePointsConfig = async (actionType, pointsValue, adminUser, req) => {
  try {
    let config = await ConfigPoints.findOne({ where: { action_type: actionType } });
    
    const dataBefore = config ? config.toJSON() : null;
    
    if (config) {
      await config.update({
        points_value: pointsValue,
        updated_at: new Date()
      });
    } else {
      config = await ConfigPoints.create({
        action_type: actionType,
        points_value: pointsValue,
        description: `Configuration pour ${actionType}`,
        active: true
      });
    }
    
    await config.reload();
    
    // Logger l'action
    try {
      await AuditLog.create({
        user_id: adminUser.id,
        action: 'UPDATE_POINTS_CONFIG',
        entity_type: 'config_points',
        entity_id: config.id,
        description: `Modification de la configuration des points pour ${actionType}: ${dataBefore?.points_value || 0} -> ${pointsValue}`,
        data_before: dataBefore,
        data_after: config.toJSON(),
        ip_address: req.ip || req.connection?.remoteAddress,
        user_agent: req.headers['user-agent']
      });
    } catch (error) {
      console.error('Erreur lors du logging audit:', error);
    }
    
    return config;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtenir toutes les configurations de points
 */
const getAllPointsConfig = async () => {
  try {
    const configs = await ConfigPoints.findAll({
      order: [['action_type', 'ASC']]
    });
    
    // Si aucune config, créer les configs par défaut
    if (configs.length === 0) {
      await getPointsConfig('referral_base');
      await getPointsConfig('referral_payment');
      return await ConfigPoints.findAll({
        order: [['action_type', 'ASC']]
      });
    }
    
    return configs;
    
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getPointsConfig,
  calculateMemberPoints,
  getLeaderboard,
  updatePointsConfig,
  getAllPointsConfig
};
