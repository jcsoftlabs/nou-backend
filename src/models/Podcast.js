const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Podcast = sequelize.define('Podcast', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  url_audio: {
    type: DataTypes.STRING(255)
  },
  url_live: {
    type: DataTypes.STRING(255)
  },
  est_en_direct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_publication: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  duree_en_secondes: {
    type: DataTypes.INTEGER
  },
  img_couverture_url: {
    type: DataTypes.STRING(255)
  },
  nombre_ecoutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Nombre de lectures/écoutes du podcast'
  }
}, {
  tableName: 'podcasts',
  timestamps: false,
  indexes: [
    { fields: ['date_publication'] },
    { fields: ['est_en_direct'] },
    { fields: ['nombre_ecoutes'] }
  ]
});

module.exports = Podcast;
