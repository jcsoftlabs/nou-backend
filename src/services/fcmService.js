const { getMessaging, isFirebaseConfigured } = require('../config/firebase');
const { FCMToken, Membre } = require('../models');
const { Op } = require('sequelize');

/**
 * Enregistrer un token FCM pour un membre
 */
const registerToken = async (membreId, token, deviceType = 'android') => {
  try {
    // Vérifier si le token existe déjà
    const existingToken = await FCMToken.findOne({ where: { token } });
    
    if (existingToken) {
      // Mettre à jour si le membre a changé ou réactiver le token
      await existingToken.update({
        membre_id: membreId,
        device_type: deviceType,
        actif: true,
        dernier_usage: new Date()
      });
      return existingToken;
    }
    
    // Créer un nouveau token
    const fcmToken = await FCMToken.create({
      membre_id: membreId,
      token,
      device_type: deviceType,
      actif: true,
      dernier_usage: new Date()
    });
    
    return fcmToken;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du token FCM:', error);
    throw new Error('Impossible d\'enregistrer le token FCM');
  }
};

/**
 * Désactiver un token FCM
 */
const unregisterToken = async (token) => {
  try {
    const fcmToken = await FCMToken.findOne({ where: { token } });
    
    if (!fcmToken) {
      throw new Error('Token non trouvé');
    }
    
    await fcmToken.update({ actif: false });
    return { message: 'Token désactivé avec succès' };
  } catch (error) {
    console.error('Erreur lors de la désactivation du token:', error);
    throw error;
  }
};

/**
 * Envoyer une notification à un seul token
 */
const sendToToken = async (token, title, body, data = {}) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase non configuré, notification non envoyée');
    return { success: false, message: 'Firebase non configuré' };
  }
  
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token
    };
    
    const response = await getMessaging().send(message);
    
    // Mettre à jour le dernier usage du token
    await FCMToken.update(
      { dernier_usage: new Date() },
      { where: { token, actif: true } }
    );
    
    console.log('✅ Notification envoyée avec succès:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    
    // Si le token est invalide, le désactiver
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      await FCMToken.update(
        { actif: false },
        { where: { token } }
      );
      console.log('Token invalide désactivé:', token);
    }
    
    throw error;
  }
};

/**
 * Envoyer une notification à plusieurs tokens
 */
const sendToMultipleTokens = async (tokens, title, body, data = {}) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase non configuré, notifications non envoyées');
    return { success: false, message: 'Firebase non configuré' };
  }
  
  if (!tokens || tokens.length === 0) {
    return { success: true, successCount: 0, failureCount: 0 };
  }
  
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens
    };
    
    const response = await getMessaging().sendEachForMulticast(message);
    
    console.log(`✅ Notifications envoyées: ${response.successCount}/${tokens.length}`);
    
    // Désactiver les tokens invalides
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (errorCode === 'messaging/invalid-registration-token' || 
              errorCode === 'messaging/registration-token-not-registered') {
            failedTokens.push(tokens[idx]);
          }
        }
      });
      
      if (failedTokens.length > 0) {
        await FCMToken.update(
          { actif: false },
          { where: { token: { [Op.in]: failedTokens } } }
        );
        console.log(`${failedTokens.length} tokens invalides désactivés`);
      }
    }
    
    // Mettre à jour le dernier usage des tokens actifs
    await FCMToken.update(
      { dernier_usage: new Date() },
      { where: { token: { [Op.in]: tokens }, actif: true } }
    );
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications multiples:', error);
    throw error;
  }
};

/**
 * Envoyer une notification de live à tous les membres actifs
 */
const sendLiveNotification = async (podcastTitle, podcastId) => {
  try {
    // Récupérer tous les tokens actifs
    const fcmTokens = await FCMToken.findAll({
      where: { actif: true },
      attributes: ['token']
    });
    
    if (fcmTokens.length === 0) {
      console.log('Aucun token FCM actif trouvé');
      return { success: true, successCount: 0, failureCount: 0 };
    }
    
    const tokens = fcmTokens.map(ft => ft.token);
    
    const title = '🔴 Live en cours !';
    const body = `${podcastTitle} est maintenant en direct`;
    const data = {
      type: 'podcast_live',
      podcast_id: String(podcastId),
      action: 'open_podcast'
    };
    
    return await sendToMultipleTokens(tokens, title, body, data);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification live:', error);
    throw error;
  }
};

/**
 * Envoyer une notification personnalisée (admin)
 */
const sendCustomNotification = async (title, body, targetType = 'all', targetIds = [], data = {}) => {
  try {
    let tokens = [];
    
    if (targetType === 'all') {
      // Tous les membres
      const fcmTokens = await FCMToken.findAll({
        where: { actif: true },
        attributes: ['token']
      });
      tokens = fcmTokens.map(ft => ft.token);
    } else if (targetType === 'specific') {
      // Membres spécifiques
      const fcmTokens = await FCMToken.findAll({
        where: { 
          actif: true,
          membre_id: { [Op.in]: targetIds }
        },
        attributes: ['token']
      });
      tokens = fcmTokens.map(ft => ft.token);
    }
    
    if (tokens.length === 0) {
      return { success: true, successCount: 0, failureCount: 0, message: 'Aucun destinataire trouvé' };
    }
    
    return await sendToMultipleTokens(tokens, title, body, data);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification personnalisée:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques des tokens FCM
 */
const getTokenStats = async () => {
  try {
    const total = await FCMToken.count();
    const actifs = await FCMToken.count({ where: { actif: true } });
    const inactifs = total - actifs;
    
    const byDevice = await FCMToken.findAll({
      attributes: [
        'device_type',
        [FCMToken.sequelize.fn('COUNT', FCMToken.sequelize.col('id')), 'count']
      ],
      where: { actif: true },
      group: ['device_type']
    });
    
    return {
      total,
      actifs,
      inactifs,
      by_device: byDevice.reduce((acc, item) => {
        acc[item.device_type] = parseInt(item.get('count'));
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des stats FCM:', error);
    throw error;
  }
};

module.exports = {
  registerToken,
  unregisterToken,
  sendToToken,
  sendToMultipleTokens,
  sendLiveNotification,
  sendCustomNotification,
  getTokenStats
};
