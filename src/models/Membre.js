const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Membre = sequelize.define('Membre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  code_adhesion: {
    type: DataTypes.STRING(50),
    unique: true
  },
  code_parrain: {
    type: DataTypes.STRING(50)
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  surnom: {
    type: DataTypes.STRING(100)
  },
  sexe: {
    type: DataTypes.STRING(20)
  },
  lieu_de_naissance: {
    type: DataTypes.STRING(255)
  },
  date_de_naissance: {
    type: DataTypes.DATEONLY
  },
  nom_pere: {
    type: DataTypes.STRING(100)
  },
  nom_mere: {
    type: DataTypes.STRING(100)
  },
  situation_matrimoniale: {
    type: DataTypes.STRING(50)
  },
  nb_enfants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nb_personnes_a_charge: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nin: {
    type: DataTypes.STRING(50)
  },
  nif: {
    type: DataTypes.STRING(50)
  },
  telephone_principal: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  telephone_etranger: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(255)
  },
  adresse_complete: {
    type: DataTypes.TEXT
  },
  profession: {
    type: DataTypes.STRING(100)
  },
  occupation: {
    type: DataTypes.STRING(100)
  },
  departement: {
    type: DataTypes.STRING(100)
  },
  commune: {
    type: DataTypes.STRING(100)
  },
  section_communale: {
    type: DataTypes.STRING(100)
  },
  facebook: {
    type: DataTypes.STRING(255)
  },
  instagram: {
    type: DataTypes.STRING(255)
  },
  a_ete_membre_politique: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role_politique_precedent: {
    type: DataTypes.STRING(255)
  },
  nom_parti_precedent: {
    type: DataTypes.STRING(255)
  },
  a_ete_membre_organisation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role_organisation_precedent: {
    type: DataTypes.STRING(255)
  },
  nom_organisation_precedente: {
    type: DataTypes.STRING(255)
  },
  referent_nom: {
    type: DataTypes.STRING(100)
  },
  referent_prenom: {
    type: DataTypes.STRING(100)
  },
  referent_adresse: {
    type: DataTypes.TEXT
  },
  referent_telephone: {
    type: DataTypes.STRING(20)
  },
  relation_avec_referent: {
    type: DataTypes.STRING(100)
  },
  a_ete_condamne: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  a_violé_loi_drogue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  a_participe_activite_terroriste: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  photo_profil_url: {
    type: DataTypes.STRING(255)
  },
  password_hash: {
    type: DataTypes.STRING(255)
  },
  role_utilisateur: {
    type: DataTypes.STRING(50),
    defaultValue: 'membre'
  },
  statut: {
    type: DataTypes.ENUM(
      'Membre pré-adhérent',
      'Membre adhérent',
      'Membre spécial',
      'Chef d\'\u00e9quipe',
      'Dirigeant',
      'Leader',
      'Dirigeant national',
      'Dirigeant départemental',
      'Dirigeant communal',
      'Dirigeant section communale'
    ),
    defaultValue: 'Membre pré-adhérent',
    field: 'Statuts'  // La colonne dans la DB s'appelle 'Statuts', mais dans le code on utilise 'statut'
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_creation'
  },
  dernier_update: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'dernier_update'
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  }
}, {
  tableName: 'membres',
  timestamps: false,
  indexes: [
    { fields: ['username'] },
    { fields: ['code_adhesion'] },
    { fields: ['telephone_principal'] },
    { fields: ['email'] }
  ]
});

module.exports = Membre;
