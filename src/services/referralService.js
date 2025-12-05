const { Referral, Membre, AuditLog } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

// Configuration des points
const REFERRAL_BASE_POINTS = parseInt(process.env.REFERRAL_BASE_POINTS) || 10;
const REFERRAL_PAYMENT_BONUS = parseInt(process.env.REFERRAL_PAYMENT_BONUS) || 5;

/**
 * Loguer une action dans la table audit
 */
const logAudit = async (userId, action, entityType, entityId, description, dataBefore, dataAfter, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      data_before: dataBefore,
      data_after: dataAfter,
      ip_address: req?.ip || req?.connection?.remoteAddress || 'system',
      user_agent: req?.headers?.['user-agent'] || 'system'
    });
  } catch (error) {
    console.error('Erreur lors du logging audit:', error);
  }
};

/**
 * Créer une relation de parrainage
 * @param {number} parrainId - ID du parrain
 * @param {number} filleulId - ID du filleul
 * @param {object} req - Objet request Express
 */
const createReferral = async (parrainId, filleulId, req = null) => {
  try {
    // Vérifier que le parrain existe
    const parrain = await Membre.findByPk(parrainId);
    if (!parrain) {
      throw new Error('Parrain non trouvé');
    }
    
    // Vérifier que le filleul existe
    const filleul = await Membre.findByPk(filleulId);
    if (!filleul) {
      throw new Error('Filleul non trouvé');
    }
    
    // Vérifier qu'un referral n'existe pas déjà
    const existingReferral = await Referral.findOne({
      where: {
        parrain_id: parrainId,
        filleul_id: filleulId
      }
    });
    
    if (existingReferral) {
      console.log('Referral déjà existant, skip');
      return existingReferral;
    }
    
    // Créer le referral avec les points de base
    const referral = await Referral.create({
      parrain_id: parrainId,
      filleul_id: filleulId,
      points_attribues: REFERRAL_BASE_POINTS
    });
    
    // Logger l'action
    await logAudit(
      parrainId,
      'CREATE_REFERRAL',
      'referral',
      referral.id,
      `Nouveau filleul ${filleul.nom} ${filleul.prenom} parrainé par ${parrain.nom} ${parrain.prenom}. ${REFERRAL_BASE_POINTS} points attribués.`,
      null,
      referral.toJSON(),
      req
    );
    
    console.log(`✅ Referral créé: ${parrain.nom} -> ${filleul.nom}, ${REFERRAL_BASE_POINTS} points`);
    
    return referral;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Ajouter des points bonus quand un filleul paie sa cotisation
 * @param {number} filleulId - ID du filleul qui a payé
 * @param {object} req - Objet request Express
 */
const addPaymentBonus = async (filleulId, req = null) => {
  try {
    // Trouver le referral où ce membre est filleul
    const referral = await Referral.findOne({
      where: { filleul_id: filleulId },
      include: [
        { model: Membre, as: 'parrain', attributes: ['id', 'nom', 'prenom', 'code_adhesion'] },
        { model: Membre, as: 'filleul', attributes: ['id', 'nom', 'prenom', 'code_adhesion'] }
      ]
    });
    
    if (!referral) {
      console.log('Pas de parrain trouvé pour ce filleul');
      return null;
    }
    
    // Sauvegarder l'état avant
    const dataBefore = referral.toJSON();
    
    // Ajouter les points bonus
    const nouveauxPoints = referral.points_attribues + REFERRAL_PAYMENT_BONUS;
    await referral.update({
      points_attribues: nouveauxPoints
    });
    
    await referral.reload();
    
    // Logger l'action
    await logAudit(
      referral.parrain_id,
      'ADD_REFERRAL_BONUS',
      'referral',
      referral.id,
      `Bonus de ${REFERRAL_PAYMENT_BONUS} points attribués à ${referral.parrain.nom} ${referral.parrain.prenom} car ${referral.filleul.nom} ${referral.filleul.prenom} a payé sa cotisation. Total: ${nouveauxPoints} points.`,
      dataBefore,
      referral.toJSON(),
      req
    );
    
    console.log(`✅ Bonus ajouté: +${REFERRAL_PAYMENT_BONUS} points pour ${referral.parrain.nom} (total: ${nouveauxPoints})`);
    
    return referral;
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout du bonus:', error);
    throw error;
  }
};

/**
 * Obtenir la liste des filleuls d'un parrain avec les points cumulés
 * @param {number} parrainId - ID du parrain
 */
const getFilleulsByParrain = async (parrainId) => {
  try {
    // Vérifier que le parrain existe
    const parrain = await Membre.findByPk(parrainId, {
      attributes: ['id', 'nom', 'prenom', 'code_adhesion', 'email', 'telephone_principal']
    });
    
    if (!parrain) {
      throw new Error('Parrain non trouvé');
    }
    
    // Récupérer tous les filleuls
    const referrals = await Referral.findAll({
      where: { parrain_id: parrainId },
      include: [
        {
          model: Membre,
          as: 'filleul',
          attributes: ['id', 'nom', 'prenom', 'code_adhesion', 'email', 'telephone_principal', 'date_creation']
        }
      ],
      order: [['date_creation', 'DESC']]
    });
    
    // Calculer les points totaux
    const pointsTotal = referrals.reduce((sum, ref) => sum + ref.points_attribues, 0);
    
    return {
      parrain: parrain.toJSON(),
      filleuls: referrals.map(ref => ({
        id: ref.id,
        filleul: ref.filleul,
        points_attribues: ref.points_attribues,
        date_creation: ref.date_creation
      })),
      statistiques: {
        nombre_filleuls: referrals.length,
        points_total: pointsTotal,
        points_base_par_filleul: REFERRAL_BASE_POINTS,
        points_bonus_par_paiement: REFERRAL_PAYMENT_BONUS
      }
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Ajuster manuellement les points d'un referral (admin)
 * @param {number} referralId - ID du referral
 * @param {number} nouveauxPoints - Nouveaux points à attribuer
 * @param {object} adminUser - Utilisateur admin
 * @param {string} raison - Raison de l'ajustement
 * @param {object} req - Objet request Express
 */
const adjustPoints = async (referralId, nouveauxPoints, adminUser, raison, req) => {
  try {
    const referral = await Referral.findByPk(referralId, {
      include: [
        { model: Membre, as: 'parrain', attributes: ['nom', 'prenom'] },
        { model: Membre, as: 'filleul', attributes: ['nom', 'prenom'] }
      ]
    });
    
    if (!referral) {
      throw new Error('Referral non trouvé');
    }
    
    const dataBefore = referral.toJSON();
    
    await referral.update({
      points_attribues: nouveauxPoints
    });
    
    await referral.reload();
    
    // Logger l'action
    await logAudit(
      adminUser.id,
      'ADJUST_REFERRAL_POINTS',
      'referral',
      referral.id,
      `Ajustement manuel des points par admin: ${dataBefore.points_attribues} -> ${nouveauxPoints}. Raison: ${raison}`,
      dataBefore,
      referral.toJSON(),
      req
    );
    
    return referral;
    
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReferral,
  addPaymentBonus,
  getFilleulsByParrain,
  adjustPoints,
  REFERRAL_BASE_POINTS,
  REFERRAL_PAYMENT_BONUS
};
