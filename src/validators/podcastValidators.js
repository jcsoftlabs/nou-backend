const Joi = require('joi');

/**
 * Schéma de validation pour créer un podcast
 */
const createPodcastSchema = Joi.object({
  titre: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Le titre est requis',
    'string.min': 'Le titre doit contenir au moins 3 caractères',
    'any.required': 'Le titre est requis'
  }),
  
  description: Joi.string().max(5000).allow('', null),
  
  url_audio: Joi.string().uri().allow('', null).messages({
    'string.uri': 'L\'URL audio doit être valide'
  }),
  
  url_live: Joi.string().uri().allow('', null).messages({
    'string.uri': 'L\'URL live doit être valide'
  }),
  
  img_couverture_url: Joi.string().uri().allow('', null).messages({
    'string.uri': 'L\'URL de l\'image doit être valide'
  }),
  
  duree_en_secondes: Joi.number().integer().min(0).allow(null),
  
  date_publication: Joi.date().iso().allow(null)
});

/**
 * Schéma de validation pour mettre à jour un podcast
 */
const updatePodcastSchema = Joi.object({
  titre: Joi.string().min(3).max(255),
  description: Joi.string().max(5000).allow('', null),
  url_audio: Joi.string().uri().allow('', null),
  url_live: Joi.string().uri().allow('', null),
  img_couverture_url: Joi.string().uri().allow('', null),
  duree_en_secondes: Joi.number().integer().min(0).allow(null),
  date_publication: Joi.date().iso().allow(null)
}).min(1); // Au moins un champ doit être fourni

module.exports = {
  createPodcastSchema,
  updatePodcastSchema
};
