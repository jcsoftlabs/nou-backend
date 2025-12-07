const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ModuleFormation = sequelize.define('ModuleFormation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  formation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'formations',
      key: 'id'
    }
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  // Type principal du contenu: texte, video, image, mixte, etc.
  type_contenu: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'texte'
  },
  // Corps du cours (texte brut, markdown ou HTML)
  contenu_texte: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Image principale illustrant le module
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Vidéo principale du module (YouTube, fichier, etc.)
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Fichier PDF (document de cours, support)
  fichier_pdf_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Fichier PowerPoint ou présentation
  fichier_ppt_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Fichiers supplémentaires (JSON array)
  // Ex: [{"type": "pdf", "url": "https://...", "nom": "doc.pdf"}]
  fichiers_supplementaires: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('fichiers_supplementaires');
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },
    set(value) {
      if (value === null || value === undefined) {
        this.setDataValue('fichiers_supplementaires', null);
      } else {
        this.setDataValue('fichiers_supplementaires', JSON.stringify(value));
      }
    }
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'modules',
  timestamps: false,
  indexes: [
    { fields: ['formation_id'] },
    { fields: ['ordre'] }
  ]
});

module.exports = ModuleFormation;
