const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ConfigPoints = sequelize.define('ConfigPoints', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Type d\'action (referral_base, referral_payment, etc.)'
  },
  points_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Valeur en points pour cette action'
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'Description de l\'action'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si cette action donne des points ou non'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'config_points',
  timestamps: false,
  indexes: [
    { fields: ['action_type'] },
    { fields: ['active'] }
  ]
});

module.exports = ConfigPoints;
