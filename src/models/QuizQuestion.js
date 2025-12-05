const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const QuizQuestion = sequelize.define('QuizQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quiz',
      key: 'id'
    }
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  option_a: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  option_b: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  option_c: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  option_d: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  bonne_reponse: {
    type: DataTypes.ENUM('a', 'b', 'c', 'd'),
    allowNull: false
  },
  points_question: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'quiz_questions',
  timestamps: false,
  indexes: [
    { fields: ['quiz_id'] }
  ]
});

module.exports = QuizQuestion;
