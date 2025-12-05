const Joi = require('joi');

/**
 * Schéma de validation pour créer une cotisation
 */
const createCotisationSchema = Joi.object({
  membre_id: Joi.number().integer().positive().required().messages({
    'number.base': 'L\'ID du membre doit être un nombre',
    'number.positive': 'L\'ID du membre doit être positif',
    'any.required': 'L\'ID du membre est requis'
  }),
  
  montant: Joi.number().positive().precision(2).max(1500).when('moyen_paiement', {
    is: Joi.string().valid('moncash', 'cash'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'number.base': 'Le montant doit être un nombre',
    'number.positive': 'Le montant doit être positif',
    'number.max': 'Le montant maximum est de 1500 HTG',
    'any.required': 'Le montant est requis pour ce moyen de paiement'
  }),
  
  moyen_paiement: Joi.string().valid('moncash', 'cash', 'recu_upload').required().messages({
    'string.base': 'Le moyen de paiement doit être une chaîne',
    'any.only': 'Le moyen de paiement doit être moncash, cash ou recu_upload',
    'any.required': 'Le moyen de paiement est requis'
  }),
  
  url_recu: Joi.string().uri().allow('', null).messages({
    'string.uri': 'L\'URL du reçu doit être valide'
  })
});

/**
 * Schéma de validation pour valider une cotisation
 */
const validerCotisationSchema = Joi.object({
  montant: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Le montant doit être un nombre valide',
    'number.positive': 'Le montant doit être positif',
    'any.required': 'Le montant est requis pour la validation'
  }),
  commentaire_verification: Joi.string().max(1000).allow('', null).messages({
    'string.max': 'Le commentaire ne peut pas dépasser 1000 caractères'
  })
});

/**
 * Schéma de validation pour rejeter une cotisation
 */
const rejeterCotisationSchema = Joi.object({
  commentaire_verification: Joi.string().required().max(1000).messages({
    'string.empty': 'Un commentaire est requis pour le rejet',
    'any.required': 'Un commentaire est requis pour le rejet',
    'string.max': 'Le commentaire ne peut pas dépasser 1000 caractères'
  })
});

/**
 * Schéma de validation pour le webhook MonCash
 */
const moncashWebhookSchema = Joi.object({
  transaction_id: Joi.string().required(),
  order_id: Joi.string().required(),
  amount: Joi.number().positive().required(),
  status: Joi.string().required(),
  // Autres champs possibles de MonCash
  timestamp: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  message: Joi.string().optional(),
  reference: Joi.string().optional()
}).unknown(true); // Accepter les champs supplémentaires de MonCash

module.exports = {
  createCotisationSchema,
  validerCotisationSchema,
  rejeterCotisationSchema,
  moncashWebhookSchema
};
