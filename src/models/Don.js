const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Don = sequelize.define('Don', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  membre_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  recu_url: {
    type: DataTypes.STRING(255)
  },
  statut_don: {
    type: DataTypes.ENUM('en_attente', 'approuve', 'rejete'),
    defaultValue: 'en_attente'
  },
  date_don: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date_verification: {
    type: DataTypes.DATE,
    allowNull: true
  },
  admin_verificateur_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  commentaire_verification: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'dons',
  timestamps: false,
  indexes: [
    { fields: ['membre_id'] },
    { fields: ['statut_don'] },
    { fields: ['date_don'] }
  ]
});

module.exports = Don;
