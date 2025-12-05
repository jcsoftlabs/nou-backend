const fcmService = require('../services/fcmService');
const Joi = require('joi');

/**
 * POST /fcm/register - Enregistrer un token FCM
 */
const registerToken = async (req, res) => {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
      device_type: Joi.string().valid('android', 'ios', 'web').default('android')
    });
    
    const { error, value } = schema.validate(req.body);
    
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
    
    const fcmToken = await fcmService.registerToken(
      req.user.id,
      value.token,
      value.device_type
    );
    
    return res.status(200).json({
      success: true,
      message: 'Token FCM enregistré avec succès',
      data: {
        id: fcmToken.id,
        device_type: fcmToken.device_type,
        actif: fcmToken.actif
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du token FCM:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'enregistrement du token'
    });
  }
};

/**
 * DELETE /fcm/unregister - Désactiver un token FCM
 */
const unregisterToken = async (req, res) => {
  try {
    const schema = Joi.object({
      token: Joi.string().required()
    });
    
    const { error, value } = schema.validate(req.body);
    
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
    
    const result = await fcmService.unregisterToken(value.token);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation du token:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la désactivation du token'
    });
  }
};

/**
 * POST /fcm/notify - Envoyer une notification personnalisée (admin)
 */
const sendCustomNotification = async (req, res) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required().max(100),
      body: Joi.string().required().max(500),
      target_type: Joi.string().valid('all', 'specific').default('all'),
      target_ids: Joi.array().items(Joi.number().integer().positive()).default([]),
      data: Joi.object().pattern(Joi.string(), Joi.string()).default({})
    });
    
    const { error, value } = schema.validate(req.body, {
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
    
    // Validation: si target_type = 'specific', target_ids ne doit pas être vide
    if (value.target_type === 'specific' && (!value.target_ids || value.target_ids.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'target_ids est requis lorsque target_type est "specific"'
      });
    }
    
    const result = await fcmService.sendCustomNotification(
      value.title,
      value.body,
      value.target_type,
      value.target_ids,
      value.data
    );
    
    return res.status(200).json({
      success: true,
      message: 'Notification envoyée avec succès',
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalTargeted: result.successCount + result.failureCount
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'envoi de la notification'
    });
  }
};

/**
 * GET /fcm/stats - Obtenir les statistiques FCM (admin)
 */
const getStats = async (req, res) => {
  try {
    const stats = await fcmService.getTokenStats();
    
    return res.status(200).json({
      success: true,
      message: 'Statistiques FCM récupérées avec succès',
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  registerToken,
  unregisterToken,
  sendCustomNotification,
  getStats
};
