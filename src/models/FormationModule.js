const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ModuleFormation = sequelize.define('ModuleFormation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  formation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'formations',
      key: 'id'
    }
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  // Type principal du contenu: texte, video, image, mixte, etc.
  type_contenu: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'texte'
  },
  // Corps du cours (texte brut, markdown ou HTML)
  contenu_texte: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Image principale illustrant le module
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Vidéo principale du module (YouTube, fichier, etc.)
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'modules',
  timestamps: false,
  indexes: [
    { fields: ['formation_id'] },
    { fields: ['ordre'] }
  ]
});

module.exports = ModuleFormation;
