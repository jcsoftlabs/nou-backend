const { Membre, Cotisation, Podcast, Quiz, AuditLog, Referral, Formation } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');
const getStats = async () => {
  try {
    const total_membres = await Membre.count();
    const total_cotisations = await Cotisation.count({
      where: { statut_paiement: 'valide' }
    });
    const totalResult = await Cotisation.sum('montant', {
      where: { statut_paiement: 'valide' }
    });
    const total_revenus = totalResult || 0;
    const cotisations_en_attente = await Cotisation.count({
      where: { statut_paiement: 'en_attente' }
    });
    const date30JoursAvant = new Date();
    date30JoursAvant.setDate(date30JoursAvant.getDate() - 30);
    const nouveaux_membres_ce_mois = await Membre.count({
      where: {
        date_creation: {
          [Op.gte]: date30JoursAvant
        }
      }
    });
    const total_filleuls = await Referral.count();
    const totalPointsResult = await Referral.sum('points_attribues');
    const total_points_parrainage = totalPointsResult || 0;
    const total_podcasts = await Podcast.count();
    const total_quiz = await Quiz.count();
    const total_formations = await Formation.count();
    return {
      total_membres,
      total_cotisations,
      total_revenus: parseFloat(total_revenus.toFixed(2)),
      cotisations_en_attente,
      nouveaux_membres_ce_mois,
      total_filleuls,
      total_points_parrainage,
      total_podcasts,
      total_quiz,
      total_formations
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw error;
  }
};

/**
 * Obtenir la liste des membres avec filtres
 */
const getMembres = async (filters = {}) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      role,
      departement,
      statut_cotisation,
      statuts
    } = filters;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Recherche par nom, prénom, email, téléphone
    if (search) {
      whereClause[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { prenom: { [Op.like]: `%${search}%` } },
        { surnom: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { telephone_principal: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filtre par rôle
    if (role) {
      whereClause.role = role;
    }
    
    // Filtre par département
    if (departement) {
      whereClause.departement = departement;
    }

    // Filtre par statuts
    if (statuts) {
      whereClause.statut = statuts;
    }
    
    const { count, rows } = await Membre.findAndCountAll({
      where: whereClause,
      attributes: { 
        exclude: ['password'] // Ne jamais exposer les mots de passe
      },
      distinct: true, // Fix pour compter correctement avec les includes
      order: [['date_creation', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Cotisation,
          as: 'cotisations',
          attributes: ['id', 'montant', 'statut_paiement', 'date_paiement'],
          required: false,
          separate: true,
          limit: 5,
          order: [['date_paiement', 'DESC']]
        }
      ]
    });
    
    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    throw error;
  }
};

/**
 * Obtenir la liste des cotisations avec filtres
 */
const getCotisations = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      statut,
      date_debut,
      date_fin,
      membre_id
    } = filters;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Filtre par statut
    if (statut) {
      whereClause.statut_paiement = statut;
    }
    
    // Filtre par membre
    if (membre_id) {
      whereClause.membre_id = membre_id;
    }
    
    // Filtre par période
    if (date_debut || date_fin) {
      whereClause.date_paiement = {};
      if (date_debut) {
        whereClause.date_paiement[Op.gte] = new Date(date_debut);
      }
      if (date_fin) {
        whereClause.date_paiement[Op.lte] = new Date(date_fin);
      }
    }
    
    const { count, rows } = await Cotisation.findAndCountAll({
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
      order: [['date_paiement', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des cotisations:', error);
    throw error;
  }
};

/**
 * Obtenir la liste des podcasts
 */
const getPodcasts = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      est_en_direct
    } = filters;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (est_en_direct !== undefined) {
      whereClause.est_en_direct = est_en_direct === 'true';
    }
    
    const { count, rows } = await Podcast.findAndCountAll({
      where: whereClause,
      order: [['date_publication', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des podcasts:', error);
    throw error;
  }
};

/**
 * Obtenir la liste des quiz
 */
const getQuiz = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      actif
    } = filters;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (actif !== undefined) {
      whereClause.actif = actif === 'true';
    }
    
    const { count, rows } = await Quiz.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: require('../models/QuizQuestion'),
          as: 'questions',
          attributes: ['id', 'question']
        }
      ],
      order: [['date_publication', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des quiz:', error);
    throw error;
  }
};

/**
 * Mettre à jour le statut d'un membre
 */
const updateMembreStatus = async (membreId, statut) => {
  try {
    const membre = await Membre.findByPk(membreId);
    
    if (!membre) {
      throw new Error('Membre introuvable');
    }
    
    // Valider que le statut est dans les valeurs autorisées
    const statutsValides = [
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
    
    if (!statutsValides.includes(statut)) {
      throw new Error(`Statut invalide. Les valeurs autorisées sont: ${statutsValides.join(', ')}`);
    }
    
    // Mettre à jour le statut
    membre.statut = statut;
    await membre.save();
    
    return membre;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques mensuelles (6 derniers mois)
 */
const getMonthlyStats = async () => {
  try {
    const results = [];
    const now = new Date();
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Boucle sur les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      // Compter les nouveaux membres pour ce mois
      const membres = await Membre.count({
        where: {
          date_creation: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });
      
      // Compter les cotisations validées pour ce mois
      const cotisations = await Cotisation.count({
        where: {
          statut_paiement: 'validé',
          date_verification: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });
      
      // Calculer le montant collecté pour ce mois
      const montantResult = await Cotisation.sum('montant', {
        where: {
          statut_paiement: 'validé',
          date_verification: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });
      
      results.push({
        name: monthNames[date.getMonth()],
        membres,
        cotisations,
        montant: montantResult || 0
      });
    }
    
    return results;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques mensuelles:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques par département
 */
const getDepartmentStats = async () => {
  try {
    // Requête SQL pour grouper et compter les membres par département
    const results = await Membre.findAll({
      attributes: [
        'departement',
        [sequelize.fn('COUNT', sequelize.col('id')), 'membres']
      ],
      where: {
        departement: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      },
      group: ['departement'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });
    
    // Formater les résultats
    return results.map(r => ({
      name: r.departement,
      membres: parseInt(r.membres)
    }));
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques par département:', error);
    throw error;
  }
};

/**
 * Obtenir les logs d'audit
 */
const getAuditLogs = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      action_type,
      user_id,
      date_debut,
      date_fin
    } = filters;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Filtre par type d'action
    if (action_type) {
      whereClause.action_type = action_type;
    }
    
    // Filtre par utilisateur
    if (user_id) {
      whereClause.user_id = user_id;
    }
    
    // Filtre par période
    if (date_debut || date_fin) {
      whereClause.created_at = {};
      if (date_debut) {
        whereClause.created_at[Op.gte] = new Date(date_debut);
      }
      if (date_fin) {
        whereClause.created_at[Op.lte] = new Date(date_fin);
      }
    }
    
    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Membre,
          as: 'user',
          attributes: ['id', 'nom', 'prenom', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error);
    throw error;
  }
};

module.exports = {
  getStats,
  getMonthlyStats,
  getDepartmentStats,
  getMembres,
  getCotisations,
  getPodcasts,
  getQuiz,
  getAuditLogs,
  updateMembreStatus
};
