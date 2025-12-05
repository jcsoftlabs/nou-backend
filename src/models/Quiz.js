const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Quiz = sequelize.define('Quiz', {
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
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  date_publication: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date_expiration: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'quiz',
  timestamps: false,
  indexes: [
    { fields: ['date_publication'] },
    { fields: ['date_expiration'] },
    { fields: ['module_id'] }
  ]
});

module.exports = Quiz;
