const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  resume: {
    type: DataTypes.TEXT
  },
  contenu: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  categorie: {
    type: DataTypes.STRING(100)
  },
  image_couverture_url: {
    type: DataTypes.STRING(255)
  },
  est_publie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_publication: {
    type: DataTypes.DATE
  },
  auteur_id: {
    type: DataTypes.INTEGER
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'news',
  timestamps: false
});

module.exports = News;
