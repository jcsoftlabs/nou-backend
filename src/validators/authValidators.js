const Joi = require('joi');

/**
 * Schéma de validation pour l'inscription
 */
const registerSchema = Joi.object({
  // Authentification
  username: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.empty': 'Le nom d\'utilisateur est requis',
      'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
      'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères',
      'string.pattern.base': 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores',
      'any.required': 'Le nom d\'utilisateur est requis'
    }),
  
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le mot de passe est requis'
  }),
  
  code_adhesion: Joi.string().required().messages({
    'string.empty': 'Le code de référence est requis',
    'any.required': 'Le code de référence est requis'
  }),
  
  // Informations personnelles obligatoires
  nom: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'any.required': 'Le nom est requis'
  }),
  
  prenom: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Le prénom est requis',
    'any.required': 'Le prénom est requis'
  }),
  
  telephone_principal: Joi.string().pattern(/^[0-9+\-() ]+$/).required().messages({
    'string.empty': 'Le téléphone principal est requis',
    'string.pattern.base': 'Le téléphone doit contenir uniquement des chiffres et caractères valides',
    'any.required': 'Le téléphone principal est requis'
  }),
  
  // Informations personnelles optionnelles
  surnom: Joi.string().max(100).allow('', null),
  
  sexe: Joi.string().valid('Masculin', 'Féminin', 'Autre', '').allow('', null),
  
  lieu_de_naissance: Joi.string().max(255).allow('', null),
  
  date_de_naissance: Joi.date().iso().allow('', null),
  
  // Informations familiales
  nom_pere: Joi.string().max(100).allow('', null),
  
  nom_mere: Joi.string().max(100).allow('', null),
  
  situation_matrimoniale: Joi.string().valid('Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)', 'Union libre', '').allow('', null),
  
  nb_enfants: Joi.number().integer().min(0).default(0),
  
  nb_personnes_a_charge: Joi.number().integer().min(0).default(0),
  
  // Documents officiels
  nin: Joi.string().max(50).allow('', null),
  
  nif: Joi.string().max(50).allow('', null),
  
  // Coordonnées
  telephone_etranger: Joi.string().pattern(/^[0-9+\-() ]+$/).allow('', null),
  
  email: Joi.string().email().allow('', null).messages({
    'string.email': 'L\'email doit être valide'
  }),
  
  adresse_complete: Joi.string().max(1000).allow('', null),
  
  // Profession et occupation
  profession: Joi.string().max(100).allow('', null),
  
  occupation: Joi.string().max(100).allow('', null),
  
  // Localisation
  departement: Joi.string().max(100).allow('', null),
  
  commune: Joi.string().max(100).allow('', null),
  
  section_communale: Joi.string().max(100).allow('', null),
  
  // Réseaux sociaux
  facebook: Joi.string().max(255).allow('', null),
  
  instagram: Joi.string().max(255).allow('', null),
  
  // Historique politique
  a_ete_membre_politique: Joi.boolean().default(false),
  
  role_politique_precedent: Joi.string().max(255).allow('', null),
  
  nom_parti_precedent: Joi.string().max(255).allow('', null),
  
  // Historique organisationnel
  a_ete_membre_organisation: Joi.boolean().default(false),
  
  role_organisation_precedent: Joi.string().max(255).allow('', null),
  
  nom_organisation_precedente: Joi.string().max(255).allow('', null),
  
  // Informations du référent
  referent_nom: Joi.string().max(100).allow('', null),
  
  referent_prenom: Joi.string().max(100).allow('', null),
  
  referent_adresse: Joi.string().max(1000).allow('', null),
  
  referent_telephone: Joi.string().pattern(/^[0-9+\-() ]+$/).allow('', null),
  
  relation_avec_referent: Joi.string().max(100).allow('', null),
  
  // Antécédents légaux
  a_ete_condamne: Joi.boolean().default(false),
  
  a_violé_loi_drogue: Joi.boolean().default(false),
  
  a_participe_activite_terroriste: Joi.boolean().default(false),
  
  // Photo de profil
  photo_profil_url: Joi.string().uri().max(255).allow('', null)
});

/**
 * Schéma de validation pour la connexion
 */
const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'string.empty': 'Email, téléphone ou nom d\'utilisateur requis',
    'any.required': 'Email, téléphone ou nom d\'utilisateur requis'
  }),
  
  password: Joi.string().required().messages({
    'string.empty': 'Le mot de passe est requis',
    'any.required': 'Le mot de passe est requis'
  })
});

/**
 * Schéma de validation pour l'envoi d'OTP
 */
const sendOtpSchema = Joi.object({
  telephone: Joi.string().pattern(/^[0-9+\-() ]+$/).required().messages({
    'string.empty': 'Le numéro de téléphone est requis',
    'string.pattern.base': 'Le numéro de téléphone doit être valide',
    'any.required': 'Le numéro de téléphone est requis'
  })
});

/**
 * Schéma de validation pour la vérification d'OTP
 */
const verifyOtpSchema = Joi.object({
  telephone: Joi.string().pattern(/^[0-9+\-() ]+$/).required().messages({
    'string.empty': 'Le numéro de téléphone est requis',
    'any.required': 'Le numéro de téléphone est requis'
  }),
  
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Le code OTP est requis',
    'string.length': 'Le code OTP doit contenir 6 chiffres',
    'string.pattern.base': 'Le code OTP doit contenir uniquement des chiffres',
    'any.required': 'Le code OTP est requis'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema
};
