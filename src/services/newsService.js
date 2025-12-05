const { Op } = require('sequelize');
const { News, Membre } = require('../models');

/**
 * Générer un slug unique à partir d'un titre
 */
const generateSlug = async (titre) => {
  const baseSlug = titre
    .toString()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

  let slug = baseSlug;
  let suffix = 1;

  // S'assurer de l'unicité du slug
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await News.findOne({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const createNews = async (data, auteurId = null) => {
  const payload = {
    titre: data.titre,
    slug: data.slug || await generateSlug(data.titre),
    resume: data.resume || null,
    contenu: data.contenu,
    categorie: data.categorie || null,
    image_couverture_url: data.image_couverture_url || null,
    est_publie: !!data.est_publie,
    date_publication: data.est_publie ? (data.date_publication || new Date()) : null,
    auteur_id: auteurId || null
  };

  const article = await News.create(payload);
  return article;
};

const updateNews = async (id, data) => {
  const article = await News.findByPk(id);
  if (!article || article.deleted_at) {
    throw new Error('Article introuvable');
  }

  if (data.titre && data.titre !== article.titre) {
    article.slug = await generateSlug(data.titre);
  }

  Object.assign(article, {
    titre: data.titre ?? article.titre,
    resume: data.resume ?? article.resume,
    contenu: data.contenu ?? article.contenu,
    categorie: data.categorie ?? article.categorie,
    image_couverture_url: data.image_couverture_url ?? article.image_couverture_url
  });

  await article.save();
  return article;
};

const deleteNews = async (id) => {
  const article = await News.findByPk(id);
  if (!article || article.deleted_at) {
    throw new Error('Article introuvable');
  }

  article.deleted_at = new Date();
  await article.save();
  return article;
};

const publishNews = async (id) => {
  const article = await News.findByPk(id);
  if (!article || article.deleted_at) {
    throw new Error('Article introuvable');
  }

  article.est_publie = true;
  article.date_publication = article.date_publication || new Date();
  await article.save();
  return article;
};

const unpublishNews = async (id) => {
  const article = await News.findByPk(id);
  if (!article || article.deleted_at) {
    throw new Error('Article introuvable');
  }

  article.est_publie = false;
  await article.save();
  return article;
};

const getNewsList = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    categorie,
    search,
    onlyPublished = true
  } = filters;

  const where = { deleted_at: null };

  if (onlyPublished) {
    where.est_publie = true;
  }

  if (categorie) {
    where.categorie = categorie;
  }

  if (search) {
    const like = `%${search}%`;
    where[Op.or] = [
      { titre: { [Op.like]: like } },
      { resume: { [Op.like]: like } },
      { contenu: { [Op.like]: like } }
    ];
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const { count, rows } = await News.findAndCountAll({
    where,
    order: [['date_publication', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
    include: [
      {
        model: Membre,
        as: 'auteur',
        attributes: ['id', 'nom', 'prenom', 'email']
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

const getNewsBySlugOrId = async (identifier) => {
  let where = { deleted_at: null };

  if (Number.isInteger(Number(identifier))) {
    where.id = Number(identifier);
  } else {
    where.slug = identifier;
  }

  const article = await News.findOne({
    where,
    include: [
      {
        model: Membre,
        as: 'auteur',
        attributes: ['id', 'nom', 'prenom', 'email']
      }
    ]
  });

  if (!article || (!article.est_publie)) {
    // Pour l’instant, on ne renvoie pas les brouillons côté public
    throw new Error('Article introuvable ou non publié');
  }

  return article;
};

module.exports = {
  createNews,
  updateNews,
  deleteNews,
  publishNews,
  unpublishNews,
  getNewsList,
  getNewsBySlugOrId
};
