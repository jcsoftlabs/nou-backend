const cotisationService = require('../services/cotisationService');
const { moncashWebhookSchema } = require('../validators/cotisationValidators');

/**
 * POST /payments/moncash/webhook
 * Recevoir et traiter les callbacks de MonCash
 */
const handleMonCashWebhook = async (req, res) => {
  try {
    console.log('📨 Webhook MonCash reçu:', JSON.stringify(req.body, null, 2));
    
    // Valider les données du webhook
    const { error, value } = moncashWebhookSchema.validate(req.body, {
      stripUnknown: true
    });
    
    if (error) {
      console.error('❌ Erreur de validation webhook:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Données webhook invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    // Traiter le webhook
    const cotisation = await cotisationService.processMonCashWebhook(value, req);
    
    console.log(`✅ Webhook traité avec succès pour cotisation #${cotisation.id}`);
    
    // Répondre à MonCash (important pour la confirmation)
    return res.status(200).json({
      success: true,
      message: 'Webhook traité avec succès',
      data: {
        cotisation_id: cotisation.id,
        statut: cotisation.statut_paiement
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook MonCash:', error);
    
    // Retourner quand même un 200 pour éviter les re-tentatives de MonCash
    // Mais logger l'erreur pour investigation manuelle
    return res.status(200).json({
      success: false,
      message: 'Erreur lors du traitement du webhook',
      error: error.message
    });
  }
};

module.exports = {
  handleMonCashWebhook
};
