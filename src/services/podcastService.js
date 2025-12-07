const { Podcast, AuditLog } = require('../models');
// const fcmService = require('./fcmService'); // Désactivé temporairement
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

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
    
    // Upload audio sur Cloudinary si configuré
    if (files?.audio) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const audioUpload = await cloudinary.uploader.upload(files.audio[0].path, {
          folder: 'nou/podcasts/audio',
          resource_type: 'video', // 'video' est utilisé pour les fichiers audio aussi
          public_id: `podcast_audio_${Date.now()}`
        });
        podcastData.url_audio = audioUpload.secure_url;
        
        // Supprimer le fichier local temporaire
        fs.unlink(files.audio[0].path, () => {});
      } else {
        // Fallback local (dev)
        podcastData.url_audio = `/uploads/podcasts/audio/${files.audio[0].filename}`;
      }
    }
    
    // Upload cover sur Cloudinary si configuré
    if (files?.cover) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const coverUpload = await cloudinary.uploader.upload(files.cover[0].path, {
          folder: 'nou/podcasts/covers',
          public_id: `podcast_cover_${Date.now()}`
        });
        podcastData.img_couverture_url = coverUpload.secure_url;
        
        // Supprimer le fichier local temporaire
        fs.unlink(files.cover[0].path, () => {});
      } else {
        // Fallback local (dev)
        podcastData.img_couverture_url = `/uploads/podcasts/covers/${files.cover[0].filename}`;
      }
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
    
    return {
      podcasts: rows,
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
    
    return podcast;
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
    
    // Upload audio sur Cloudinary si un nouveau fichier est fourni
    if (files?.audio) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const audioUpload = await cloudinary.uploader.upload(files.audio[0].path, {
          folder: 'nou/podcasts/audio',
          resource_type: 'video',
          public_id: `podcast_audio_${Date.now()}`
        });
        updateData.url_audio = audioUpload.secure_url;
        
        // Supprimer le fichier local temporaire
        fs.unlink(files.audio[0].path, () => {});
      } else {
        updateData.url_audio = `/uploads/podcasts/audio/${files.audio[0].filename}`;
      }
    }
    
    // Upload cover sur Cloudinary si une nouvelle cover est fournie
    if (files?.cover) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const coverUpload = await cloudinary.uploader.upload(files.cover[0].path, {
          folder: 'nou/podcasts/covers',
          public_id: `podcast_cover_${Date.now()}`
        });
        updateData.img_couverture_url = coverUpload.secure_url;
        
        // Supprimer le fichier local temporaire
        fs.unlink(files.cover[0].path, () => {});
      } else {
        updateData.img_couverture_url = `/uploads/podcasts/covers/${files.cover[0].filename}`;
      }
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
