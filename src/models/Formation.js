const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Formation = sequelize.define('Formation', {
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
  niveau: {
    type: DataTypes.STRING(50)
  },
  image_couverture_url: {
    type: DataTypes.STRING(255)
  },
  est_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  date_publication: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'formations',
  timestamps: false,
  indexes: [
    { fields: ['est_active'] },
    { fields: ['date_publication'] }
  ]
});

module.exports = Formation;
