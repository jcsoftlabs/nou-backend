const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const FCMToken = sequelize.define('FCMToken', {
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
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  device_type: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: false,
    defaultValue: 'android'
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  dernier_usage: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'fcm_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['membre_id']
    },
    {
      fields: ['token']
    },
    {
      fields: ['actif']
    }
  ]
});

module.exports = FCMToken;
