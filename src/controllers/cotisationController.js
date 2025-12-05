const cotisationService = require('../services/cotisationService');
const {
  createCotisationSchema,
  validerCotisationSchema,
  rejeterCotisationSchema
} = require('../validators/cotisationValidators');

/**
 * POST /cotisations
 * Créer une nouvelle cotisation
 */
const createCotisation = async (req, res) => {
  try {
    // Valider les données avec Joi
    const { error, value } = createCotisationSchema.validate(req.body, {
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
    
    // Gérer l'URL du reçu (si upload)
    let urlRecu = value.url_recu;
    
    if (req.file) {
      // Construction de l'URL accessible du reçu uploadé
      urlRecu = `/uploads/receipts/${req.file.filename}`;
    }
    
    // Vérifier que pour recu_upload, un fichier est fourni
    if (value.moyen_paiement === 'recu_upload' && !urlRecu) {
      return res.status(400).json({
        success: false,
        message: 'Un fichier de reçu est requis pour le moyen de paiement "recu_upload"'
      });
    }
    
    // Appeler le service
    const cotisation = await cotisationService.createCotisation(value, urlRecu, req);
    
    return res.status(201).json({
      success: true,
      message: 'Cotisation créée avec succès',
      data: cotisation
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la cotisation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la cotisation'
    });
  }
};

/**
 * PUT /cotisations/:id/valider
 * Valider une cotisation (admin)
 */
const validerCotisation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Valider les données avec Joi
    const { error, value } = validerCotisationSchema.validate(req.body, {
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
    
    // Appeler le service
    const cotisation = await cotisationService.validerCotisation(
      id,
      req.user,
      value.montant,
      value.commentaire_verification,
      req
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
 * PUT /cotisations/:id/rejeter
 * Rejeter une cotisation (admin)
 */
const rejeterCotisation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Valider les données avec Joi
    const { error, value } = rejeterCotisationSchema.validate(req.body, {
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
    
    // Appeler le service
    const cotisation = await cotisationService.rejeterCotisation(
      id,
      req.user,
      value.commentaire_verification,
      req
    );
    
    return res.status(200).json({
      success: true,
      message: 'Cotisation rejetée avec succès',
      data: cotisation
    });
    
  } catch (error) {
    console.error('Erreur lors du rejet de la cotisation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du rejet de la cotisation'
    });
  }
};

/**
 * GET /cotisations/mon-statut
 * Obtenir le statut de cotisation de l'année en cours pour le membre connecté
 */
const getMonStatutCotisation = async (req, res) => {
  try {
    const membreId = req.user.id;
    
    const totalVerse = await cotisationService.getTotalCotisationsAnnee(membreId);
    const restant = 1500 - totalVerse;
    const estComplet = totalVerse >= 1500;
    const isPremier = await cotisationService.isPremierVersementAnnee(membreId);
    
    return res.status(200).json({
      success: true,
      message: 'Statut de cotisation récupéré avec succès',
      data: {
        annee: new Date().getFullYear(),
        montant_total_annuel: 1500,
        montant_verse: totalVerse,
        montant_restant: restant,
        est_complet: estComplet,
        est_premier_versement: isPremier,
        montant_minimum_prochain_versement: isPremier ? 150 : 1
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du statut de cotisation'
    });
  }
};

/**
 * GET /cotisations
 * Récupérer les cotisations (avec filtres optionnels)
 */
const getCotisations = async (req, res) => {
  try {
    const { membre_id, statut_paiement } = req.query;
    
    const cotisations = await cotisationService.getCotisations({
      membre_id,
      statut_paiement
    });
    
    return res.status(200).json({
      success: true,
      message: 'Cotisations récupérées avec succès',
      data: { cotisations }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des cotisations:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des cotisations'
    });
  }
};

/**
 * GET /cotisations/last/:membreId
 * Récupérer la dernière cotisation d'un membre
 */
const getLastCotisation = async (req, res) => {
  try {
    const { membreId } = req.params;
    
    const cotisation = await cotisationService.getLastCotisation(membreId);
    
    if (!cotisation) {
      return res.status(404).json({
        success: false,
        message: 'Aucune cotisation trouvée pour ce membre'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Dernière cotisation récupérée avec succès',
      data: cotisation
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière cotisation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la dernière cotisation'
    });
  }
};

module.exports = {
  createCotisation,
  getCotisations,
  getLastCotisation,
  getMonStatutCotisation,
  validerCotisation,
  rejeterCotisation
};
