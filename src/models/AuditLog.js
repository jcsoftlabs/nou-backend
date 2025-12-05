const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'membres',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT
  },
  data_before: {
    type: DataTypes.JSON
  },
  data_after: {
    type: DataTypes.JSON
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.STRING(255)
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['entity_type'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AuditLog;
