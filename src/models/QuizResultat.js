const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const QuizResultat = sequelize.define('QuizResultat', {
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
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quiz',
      key: 'id'
    }
  },
  score_total: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bonnes_reponses: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_participation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quiz_resultats',
  timestamps: false,
  indexes: [
    { fields: ['membre_id'] },
    { fields: ['quiz_id'] },
    { fields: ['date_participation'] },
    { unique: true, fields: ['membre_id', 'quiz_id'] }
  ]
});

module.exports = QuizResultat;
