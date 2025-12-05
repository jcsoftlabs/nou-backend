const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Cotisation = sequelize.define('Cotisation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  membre_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'membres',
      key: 'id'
    }
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  moyen_paiement: {
    type: DataTypes.ENUM('moncash', 'cash', 'recu_upload'),
    allowNull: false
  },
  url_recu: {
    type: DataTypes.STRING(255)
  },
  statut_paiement: {
    type: DataTypes.ENUM('en_attente', 'valide', 'rejete'),
    defaultValue: 'en_attente'
  },
  date_paiement: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date_verification: {
    type: DataTypes.DATE
  },
  admin_verificateur_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'membres',
      key: 'id'
    }
  },
  commentaire_verification: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'cotisations',
  timestamps: false,
  indexes: [
    { fields: ['membre_id'] },
    { fields: ['statut_paiement'] },
    { fields: ['date_paiement'] }
  ]
});

module.exports = Cotisation;
