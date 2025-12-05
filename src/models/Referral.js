const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parrain_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'membres',
      key: 'id'
    }
  },
  filleul_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'membres',
      key: 'id'
    }
  },
  points_attribues: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'referrals',
  timestamps: false,
  indexes: [
    { fields: ['parrain_id'] },
    { fields: ['filleul_id'] },
    { fields: ['date_creation'] },
    { unique: true, fields: ['parrain_id', 'filleul_id'] }
  ]
});

module.exports = Referral;
