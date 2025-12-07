const { Podcast, AuditLog } = require('../models');
// const fcmService = require('./fcmService'); // Désactivé temporairement
const path = require('path');
const fs = require('fs');

/**
 * Convertir les URLs relatives en URLs complètes
 */
const getFullUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  // Utiliser l'URL de base depuis les variables d'environnement ou Railway
  const baseUrl = process.env.BASE_URL || process.env.RAILWAY_STATIC_URL || 'http://localhost:4000';
  return `${baseUrl}${relativePath}`;
};
/**
 * Logger une action dans audit
 */
const logAudit = async (userId, action, entityId, description, dataBefore, dataAfter, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: 'podcast',
      entity_id: entityId,
      description,
      data_before: dataBefore,
      data_after: dataAfter,
      ip_address: req?.ip || req?.connection?.remoteAddress,
      user_agent: req?.headers?.['user-agent']
    });
  } catch (error) {
    console.error('Erreur lors du logging audit:', error);
  }
};

/**
 * Créer un nouveau podcast
 */
const createPodcast = async (data, files, adminUser, req) => {
  try {
    // Construire les URLs des fichiers uploadés
    const podcastData = { ...data };
    
    if (files?.audio) {
      podcastData.url_audio = `/uploads/podcasts/audio/${files.audio[0].filename}`;
    }
    
    if (files?.cover) {
      podcastData.img_couverture_url = `/uploads/podcasts/covers/${files.cover[0].filename}`;
    }
    
    // Créer le podcast
    const podcast = await Podcast.create(podcastData);
    
    // Logger
    await logAudit(
      adminUser.id,
      'CREATE_PODCAST',
      podcast.id,
      `Création du podcast "${podcast.titre}"`,
      null,
      podcast.toJSON(),
      req
    );
    
    return podcast;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtenir la liste paginée des podcasts
 */
const getPodcasts = async (options = {}) => {
  try {
    const { page = 1, limit = 20, est_en_direct } = options;
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
    
    // Convertir les URLs relatives en URLs complètes
    const podcastsWithFullUrls = rows.map(podcast => {
      const podcastData = podcast.toJSON();
      podcastData.url_audio = getFullUrl(podcastData.url_audio);
      podcastData.img_couverture_url = getFullUrl(podcastData.img_couverture_url);
      podcastData.url_live = getFullUrl(podcastData.url_live);
      return podcastData;
    });
    
    return {
      podcasts: podcastsWithFullUrls,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtenir un podcast par ID
 */
const getPodcastById = async (id) => {
  try {
    const podcast = await Podcast.findByPk(id);
    
    if (!podcast) {
      throw new Error('Podcast non trouvé');
    }
    
    // Convertir les URLs relatives en URLs complètes
    const podcastData = podcast.toJSON();
    podcastData.url_audio = getFullUrl(podcastData.url_audio);
    podcastData.img_couverture_url = getFullUrl(podcastData.img_couverture_url);
    podcastData.url_live = getFullUrl(podcastData.url_live);
    
    return podcastData;
  } catch (error) {
    throw error;
  }
};

/**
 * Mettre à jour un podcast
 */
const updatePodcast = async (id, data, files, adminUser, req) => {
  try {
    const podcast = await Podcast.findByPk(id);
    
    if (!podcast) {
      throw new Error('Podcast non trouvé');
    }
    
    const dataBefore = podcast.toJSON();
    
    // Mettre à jour avec les nouvelles données
    const updateData = { ...data };
    
    if (files?.audio) {
      updateData.url_audio = `/uploads/podcasts/audio/${files.audio[0].filename}`;
    }
    
    if (files?.cover) {
      updateData.img_couverture_url = `/uploads/podcasts/covers/${files.cover[0].filename}`;
    }
    
    await podcast.update(updateData);
    await podcast.reload();
    
    // Logger
    await logAudit(
      adminUser.id,
      'UPDATE_PODCAST',
      podcast.id,
      `Mise à jour du podcast "${podcast.titre}"`,
      dataBefore,
      podcast.toJSON(),
      req
    );
    
    return podcast;
  } catch (error) {
    throw error;
  }
};

/**
 * Supprimer un podcast
 */
const deletePodcast = async (id, adminUser, req) => {
  try {
    const podcast = await Podcast.findByPk(id);
    
    if (!podcast) {
      throw new Error('Podcast non trouvé');
    }
    
    const dataBefore = podcast.toJSON();
    
    await podcast.destroy();
    
    // Logger
    await logAudit(
      adminUser.id,
      'DELETE_PODCAST',
      id,
      `Suppression du podcast "${podcast.titre}"`,
      dataBefore,
      null,
      req
    );
    
    return { success: true, message: 'Podcast supprimé avec succès' };
  } catch (error) {
    throw error;
  }
};

/**
 * Démarrer un live
 */
const startLive = async (id, url_live, adminUser, req) => {
  try {
    const podcast = await Podcast.findByPk(id);
    
    if (!podcast) {
      throw new Error('Podcast non trouvé');
    }
    
    const dataBefore = podcast.toJSON();
    
    await podcast.update({
      est_en_direct: true,
      url_live: url_live || podcast.url_live
    });
    
    await podcast.reload();
    
    // Logger
    await logAudit(
      adminUser.id,
      'START_LIVE_PODCAST',
      podcast.id,
      `Démarrage du live pour "${podcast.titre}"`,
      dataBefore,
      podcast.toJSON(),
      req
    );
    
    // TODO: Notification push désactivée temporairement
    // Décommenter quand Firebase sera configuré
    /*
    try {
      const notificationResult = await fcmService.sendLiveNotification(
        podcast.titre,
        podcast.id
      );
      console.log(`📱 Notifications envoyées: ${notificationResult.successCount}/${notificationResult.successCount + notificationResult.failureCount}`);
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications:', notifError);
    }
    */
    
    return podcast;
  } catch (error) {
    throw error;
  }
};

/**
 * Arrêter un live
 */
const stopLive = async (id, adminUser, req) => {
  try {
    const podcast = await Podcast.findByPk(id);
    
    if (!podcast) {
      throw new Error('Podcast non trouvé');
    }
    
    const dataBefore = podcast.toJSON();
    
    await podcast.update({
      est_en_direct: false
    });
    
    await podcast.reload();
    
    // Logger
    await logAudit(
      adminUser.id,
      'STOP_LIVE_PODCAST',
      podcast.id,
      `Arrêt du live pour "${podcast.titre}"`,
      dataBefore,
      podcast.toJSON(),
      req
    );
    
    return podcast;
  } catch (error) {
    throw error;
  }
};

/**
 * Incrémenter le compteur d'écoutes
 */
const incrementListens = async (id) => {
  try {
    const podcast = await Podcast.findByPk(id);
    
    if (!podcast) {
      throw new Error('Podcast non trouvé');
    }
    
    await podcast.increment('nombre_ecoutes');
    await podcast.reload();
    
    return podcast;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createPodcast,
  getPodcasts,
  getPodcastById,
  updatePodcast,
  deletePodcast,
  startLive,
  stopLive,
  incrementListens
};
