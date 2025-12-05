const Joi = require('joi');

/**
 * Schéma de validation pour créer/modifier un membre (par admin)
 * Accepte les mêmes champs que registerSchema + role_utilisateur et code_parrain
 */
const createOrUpdateMembreSchema = Joi.object({
  // Champs obligatoires
  nom: Joi.string().min(2).max(100).required(),
  prenom: Joi.string().min(2).max(100).required(),
  telephone_principal: Joi.string().pattern(/^[0-9+\-() ]+$/).required(),
  password: Joi.string().min(6).when('id', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  
  // ID pour modification (optionnel)
  id: Joi.number().integer().positive(),
  
  // Champs spécifiques admin
  role_utilisateur: Joi.string().valid('membre', 'admin', 'partner').default('membre'),
  code_parrain: Joi.string().max(50).allow('', null),
  code_adhesion: Joi.string().max(50).allow('', null),
  
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
  email: Joi.string().email().allow('', null),
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

module.exports = {
  createOrUpdateMembreSchema
};
