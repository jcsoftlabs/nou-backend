const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Album = sequelize.define('Album', {
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
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_evenement: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date de l\'événement associé à l\'album'
  },
  lieu_evenement: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Lieu où l\'événement a eu lieu'
  },
  image_couverture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de l\'image de couverture de l\'album'
  },
  est_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indique si l\'album est visible par tous ou uniquement par les admins'
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Ordre d\'affichage de l\'album'
  },
  auteur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'membres',
      key: 'id'
    },
    comment: 'ID de l\'admin qui a créé l\'album'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'albums',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Album;
