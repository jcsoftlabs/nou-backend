const { Cotisation, Membre, AuditLog } = require('../models');
const referralService = require('./referralService');

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
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Erreur lors du logging audit:', error);
  }
};

/**
 * Calculer le total des cotisations validées d'un membre pour sa période d'adhésion annuelle
 * La période commence à la date de création du membre et dure 12 mois
 */
const getTotalCotisationsAnnee = async (membreId) => {
  const { Op } = require('sequelize');
  
  // Récupérer la date de création du membre
  const membre = await Membre.findByPk(membreId);
  if (!membre) {
    throw new Error('Membre non trouvé');
  }
  
  const dateAdhesion = new Date(membre.date_creation);
  const maintenant = new Date();
  
  // Calculer le début de la période d'adhésion actuelle (anniversaire le plus récent)
  let debutPeriode = new Date(dateAdhesion);
  debutPeriode.setFullYear(maintenant.getFullYear());
  
  // Si l'anniversaire de cette année n'est pas encore passé, prendre l'année précédente
  if (debutPeriode > maintenant) {
    debutPeriode.setFullYear(maintenant.getFullYear() - 1);
  }
  
  // Fin de période = 12 mois après le début
  const finPeriode = new Date(debutPeriode);
  finPeriode.setFullYear(debutPeriode.getFullYear() + 1);
  finPeriode.setDate(finPeriode.getDate() - 1); // Dernier jour de la période
  finPeriode.setHours(23, 59, 59, 999);
  
  const cotisations = await Cotisation.findAll({
    where: {
      membre_id: membreId,
      statut_paiement: 'valide',
      date_paiement: {
        [Op.between]: [debutPeriode, finPeriode]
      }
    }
  });
  
  const total = cotisations.reduce((sum, c) => sum + parseFloat(c.montant), 0);
  return total;
};

/**
 * Vérifier si c'est le premier versement de la période d'adhésion annuelle
 * La période commence à la date de création du membre et dure 12 mois
 */
const isPremierVersementAnnee = async (membreId) => {
  const { Op } = require('sequelize');
  
  // Récupérer la date de création du membre
  const membre = await Membre.findByPk(membreId);
  if (!membre) {
    throw new Error('Membre non trouvé');
  }
  
  const dateAdhesion = new Date(membre.date_creation);
  const maintenant = new Date();
  
  // Calculer le début de la période d'adhésion actuelle (anniversaire le plus récent)
  let debutPeriode = new Date(dateAdhesion);
  debutPeriode.setFullYear(maintenant.getFullYear());
  
  // Si l'anniversaire de cette année n'est pas encore passé, prendre l'année précédente
  if (debutPeriode > maintenant) {
    debutPeriode.setFullYear(maintenant.getFullYear() - 1);
  }
  
  // Fin de période = 12 mois après le début
  const finPeriode = new Date(debutPeriode);
  finPeriode.setFullYear(debutPeriode.getFullYear() + 1);
  finPeriode.setDate(finPeriode.getDate() - 1);
  finPeriode.setHours(23, 59, 59, 999);
  
  const count = await Cotisation.count({
    where: {
      membre_id: membreId,
      statut_paiement: 'valide',
      date_paiement: {
        [Op.between]: [debutPeriode, finPeriode]
      }
    }
  });
  
  return count === 0;
};

/**
 * Créer une nouvelle cotisation
 */
const createCotisation = async (data, urlRecu = null, req) => {
  try {
    // Vérifier que le membre existe
    const membre = await Membre.findByPk(data.membre_id);
    if (!membre) {
      throw new Error('Membre non trouvé');
    }
    
    // Déterminer le statut initial
    let statut_paiement = 'en_attente';
    
    // Pour MonCash et Cash, le montant est déjà validé par le validateur
    // Pour recu_upload, le montant est optionnel à la création
    const montant = data.montant ? parseFloat(data.montant) : 0;
    
    if (montant > 1500) {
      throw new Error('Le montant ne peut pas dépasser 1500 HTG');
    }
    
    // Préparer les données de la cotisation
    const cotisationData = {
      membre_id: data.membre_id,
      montant: montant, // Peut être 0 si c'est un reçu uploadé sans montant initial
      moyen_paiement: data.moyen_paiement,
      url_recu: urlRecu || data.url_recu || null,
      statut_paiement,
      date_paiement: new Date()
    };
    
    // Créer la cotisation
    const cotisation = await Cotisation.create(cotisationData);
    
    // Logger l'action
    await logAudit(
      data.membre_id,
      'CREATE_COTISATION',
      'cotisation',
      cotisation.id,
      `Création d'une cotisation de ${data.montant} HTG par ${data.moyen_paiement}`,
      null,
      cotisation.toJSON(),
      req
    );
    
    return cotisation;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Valider une cotisation (admin)
 */
const validerCotisation = async (cotisationId, adminUser, montantValidation, commentaire, req) => {
  try {
    const cotisation = await Cotisation.findByPk(cotisationId);
    
    if (!cotisation) {
      throw new Error('Cotisation non trouvée');
    }
    
    if (cotisation.statut_paiement === 'valide') {
      throw new Error('Cette cotisation est déjà validée');
    }
    
    // Logique de validation des montants
    const membreId = cotisation.membre_id;
    const totalAnneeAvant = await getTotalCotisationsAnnee(membreId);
    const isPremier = await isPremierVersementAnnee(membreId);
    const montantValide = parseFloat(montantValidation);
    
    // 1. Vérifier que le premier versement est au moins 150 HTG
    if (isPremier && montantValide < 150) {
      throw new Error('Validation impossible: le premier versement doit être d\'au moins 150 HTG');
    }
    
    // 2. Vérifier que le total ne dépasse pas 1500 HTG pour l'année
    if (totalAnneeAvant + montantValide > 1500) {
      const restant = 1500 - totalAnneeAvant;
      throw new Error(`Validation impossible: le montant dépasse la cotisation annuelle. Il reste ${restant > 0 ? restant : 0} HTG à payer.`);
    }
    
    // Sauvegarder les données avant modification
    const dataBefore = cotisation.toJSON();
    
    // Mettre à jour la cotisation
    await cotisation.update({
      montant: montantValide, // Mise à jour avec le montant validé par l'admin
      statut_paiement: 'valide',
      admin_verificateur_id: adminUser.id,
      date_verification: new Date(),
      commentaire_verification: commentaire || 'Paiement validé'
    });
    
    await cotisation.reload();
    
    // Logger l'action
    await logAudit(
      adminUser.id,
      'VALIDATE_COTISATION',
      'cotisation',
      cotisation.id,
      `Validation de la cotisation #${cotisation.id} par admin`,
      dataBefore,
      cotisation.toJSON(),
      req
    );
    
    // Ajouter bonus de parrainage si applicable
    try {
      await referralService.addPaymentBonus(cotisation.membre_id, req);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bonus parrainage:', error);
      // Ne pas bloquer la validation si le bonus échoue
    }
    
    return cotisation;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Rejeter une cotisation (admin)
 */
const rejeterCotisation = async (cotisationId, adminUser, commentaire, req) => {
  try {
    const cotisation = await Cotisation.findByPk(cotisationId);
    
    if (!cotisation) {
      throw new Error('Cotisation non trouvée');
    }
    
    if (cotisation.statut_paiement === 'rejete') {
      throw new Error('Cette cotisation est déjà rejetée');
    }
    
    if (!commentaire) {
      throw new Error('Un commentaire est requis pour rejeter une cotisation');
    }
    
    // Sauvegarder les données avant modification
    const dataBefore = cotisation.toJSON();
    
    // Mettre à jour la cotisation
    await cotisation.update({
      statut_paiement: 'rejete',
      admin_verificateur_id: adminUser.id,
      date_verification: new Date(),
      commentaire_verification: commentaire
    });
    
    await cotisation.reload();
    
    // Logger l'action
    await logAudit(
      adminUser.id,
      'REJECT_COTISATION',
      'cotisation',
      cotisation.id,
      `Rejet de la cotisation #${cotisation.id} par admin`,
      dataBefore,
      cotisation.toJSON(),
      req
    );
    
    return cotisation;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Traiter le callback webhook MonCash
 */
const processMonCashWebhook = async (webhookData, req) => {
  try {
    // TODO: Vérifier la signature du webhook MonCash pour sécurité
    
    const { transaction_id, order_id, amount, status } = webhookData;
    
    // Rechercher la cotisation correspondante (order_id devrait correspondre à l'ID de cotisation)
    const cotisation = await Cotisation.findByPk(order_id);
    
    if (!cotisation) {
      throw new Error(`Cotisation #${order_id} non trouvée`);
    }
    
    // Vérifier que le montant correspond
    if (parseFloat(amount) !== parseFloat(cotisation.montant)) {
      throw new Error('Le montant du paiement ne correspond pas');
    }
    
    // Sauvegarder les données avant modification
    const dataBefore = cotisation.toJSON();
    
    // Mettre à jour selon le statut MonCash
    if (status === 'success' || status === 'completed' || status === 'approved') {
      await cotisation.update({
        statut_paiement: 'valide',
        date_verification: new Date(),
        commentaire_verification: `Paiement MonCash validé automatiquement. Transaction ID: ${transaction_id}`
      });
      
      await cotisation.reload();
      
      // Ajouter bonus de parrainage si applicable
      try {
        await referralService.addPaymentBonus(cotisation.membre_id, req);
      } catch (error) {
        console.error('Erreur lors de l\'ajout du bonus parrainage:', error);
      }
      
    } else if (status === 'failed' || status === 'cancelled') {
      await cotisation.update({
        statut_paiement: 'rejete',
        date_verification: new Date(),
        commentaire_verification: `Paiement MonCash échoué. Statut: ${status}. Transaction ID: ${transaction_id}`
      });
      
      await cotisation.reload();
    }
    
    // Logger l'action
    await logAudit(
      null,
      'MONCASH_WEBHOOK',
      'cotisation',
      cotisation.id,
      `Callback MonCash reçu. Transaction: ${transaction_id}, Statut: ${status}`,
      dataBefore,
      cotisation.toJSON(),
      req
    );
    
    return cotisation;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer les cotisations avec filtres optionnels
 */
const getCotisations = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.membre_id) {
      where.membre_id = filters.membre_id;
    }
    
    if (filters.statut_paiement) {
      where.statut_paiement = filters.statut_paiement;
    }
    
    const cotisations = await Cotisation.findAll({
      where,
      order: [['date_paiement', 'DESC']],
      include: [{
        model: Membre,
        as: 'membre',
        attributes: ['id', 'nom', 'prenom', 'email', 'code_adhesion']
      }]
    });
    
    return cotisations;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer la dernière cotisation d'un membre
 */
const getLastCotisation = async (membreId) => {
  try {
    const cotisation = await Cotisation.findOne({
      where: { membre_id: membreId },
      order: [['date_paiement', 'DESC']],
      limit: 1
    });
    
    return cotisation;
    
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCotisation,
  getCotisations,
  getLastCotisation,
  validerCotisation,
  rejeterCotisation,
  processMonCashWebhook,
  getTotalCotisationsAnnee,
  isPremierVersementAnnee
};
