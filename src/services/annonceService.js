const { Op } = require('sequelize');
const { Annonce, Membre } = require('../models');

const createAnnonce = async (data, auteurId = null) => {
  const annonce = await Annonce.create({
    titre: data.titre,
    message: data.message,
    priorite: data.priorite || 'info',
    statut: data.statut || 'brouillon',
    date_publication: data.statut === 'publie' ? (data.date_publication || new Date()) : null,
    date_expiration: data.date_expiration || null,
    auteur_id: auteurId || null
  });

  return annonce;
};

const updateAnnonce = async (id, data) => {
  const annonce = await Annonce.findByPk(id);
  if (!annonce) {
    throw new Error('Annonce introuvable');
  }

  Object.assign(annonce, {
    titre: data.titre ?? annonce.titre,
    message: data.message ?? annonce.message,
    priorite: data.priorite ?? annonce.priorite,
    date_expiration: data.date_expiration ?? annonce.date_expiration
  });

  await annonce.save();
  return annonce;
};

const changeAnnonceStatus = async (id, statut) => {
  const annonce = await Annonce.findByPk(id);
  if (!annonce) {
    throw new Error('Annonce introuvable');
  }

  annonce.statut = statut;
  if (statut === 'publie' && !annonce.date_publication) {
    annonce.date_publication = new Date();
  }

  await annonce.save();
  return annonce;
};

const getActiveAnnonces = async () => {
  const now = new Date();

  const annonces = await Annonce.findAll({
    where: {
      statut: 'publie',
      [Op.or]: [
        { date_expiration: null },
        { date_expiration: { [Op.gt]: now } }
      ]
    },
    order: [
      ['priorite', 'DESC'],
      ['date_publication', 'DESC'],
      ['created_at', 'DESC']
    ],
    include: [
      {
        model: Membre,
        as: 'auteur',
        attributes: ['id', 'nom', 'prenom']
      }
    ]
  });

  return annonces;
};

const getAllAnnonces = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    statut,
    priorite
  } = filters;

  const where = {};

  if (statut) {
    where.statut = statut;
  }

  if (priorite) {
    where.priorite = priorite;
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const { count, rows } = await Annonce.findAndCountAll({
    where,
    order: [
      ['created_at', 'DESC']
    ],
    limit: parseInt(limit, 10),
    offset,
    include: [
      {
        model: Membre,
        as: 'auteur',
        attributes: ['id', 'nom', 'prenom']
      }
    ]
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(count / limit)
    }
  };
};

module.exports = {
  createAnnonce,
  updateAnnonce,
  changeAnnonceStatus,
  getActiveAnnonces,
  getAllAnnonces
};
