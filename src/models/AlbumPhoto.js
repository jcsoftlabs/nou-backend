const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AlbumPhoto = sequelize.define('AlbumPhoto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  album_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID de l\'album auquel appartient cette photo'
  },
  url_photo: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL de la photo'
  },
  legende: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Légende ou description de la photo'
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Ordre d\'affichage de la photo dans l\'album'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'album_photos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AlbumPhoto;
