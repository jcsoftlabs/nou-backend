const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Annonce = sequelize.define('Annonce', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priorite: {
    type: DataTypes.ENUM('info', 'important', 'urgent'),
    defaultValue: 'info'
  },
  statut: {
    type: DataTypes.ENUM('brouillon', 'publie', 'archive'),
    defaultValue: 'brouillon'
  },
  date_publication: {
    type: DataTypes.DATE
  },
  date_expiration: {
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
  }
}, {
  tableName: 'annonces',
  timestamps: false
});

module.exports = Annonce;
