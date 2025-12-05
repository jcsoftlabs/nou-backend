const newsService = require('../services/newsService');

// Public: liste des articles publiés
const getPublicNewsList = async (req, res) => {
  try {
    const { page, limit, categorie, search } = req.query;
    const result = await newsService.getNewsList({
      page,
      limit,
      categorie,
      search,
      onlyPublished: true
    });

    return res.status(200).json({
      success: true,
      message: 'Articles récupérés avec succès',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des news:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des news'
    });
  }
};

// Public: détail d'un article
const getPublicNewsDetail = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const article = await newsService.getNewsBySlugOrId(slugOrId);

    return res.status(200).json({
      success: true,
      message: 'Article récupéré avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    return res.status(404).json({
      success: false,
      message: error.message || 'Article introuvable'
    });
  }
};

// Admin: liste complète
const adminGetNewsList = async (req, res) => {
  try {
    const { page, limit, categorie, search, onlyPublished } = req.query;
    const result = await newsService.getNewsList({
      page,
      limit,
      categorie,
      search,
      onlyPublished: onlyPublished === 'true'
    });

    return res.status(200).json({
      success: true,
      message: 'Articles récupérés avec succès',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Erreur admin lors de la récupération des news:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des news'
    });
  }
};

// Admin: création
const adminCreateNews = async (req, res) => {
  try {
    const data = req.body;

    if (!data.titre || !data.contenu) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et le contenu sont obligatoires'
      });
    }

    const article = await newsService.createNews(data, req.user?.id || null);

    return res.status(201).json({
      success: true,
      message: 'Article créé avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la création de news:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'article'
    });
  }
};

// Admin: mise à jour
const adminUpdateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await newsService.updateNews(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Article mis à jour avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de news:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de l\'article'
    });
  }
};

// Admin: suppression (soft delete)
const adminDeleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await newsService.deleteNews(id);

    return res.status(200).json({
      success: true,
      message: 'Article supprimé avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de news:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de l\'article'
    });
  }
};

// Admin: publier / dépublier
const adminPublishNews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await newsService.publishNews(id);

    return res.status(200).json({
      success: true,
      message: 'Article publié avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la publication de news:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la publication de l\'article'
    });
  }
};

const adminUnpublishNews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await newsService.unpublishNews(id);

    return res.status(200).json({
      success: true,
      message: 'Article dépublié avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la dépublication de news:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la dépublication de l\'article'
    });
  }
};

module.exports = {
  getPublicNewsList,
  getPublicNewsDetail,
  adminGetNewsList,
  adminCreateNews,
  adminUpdateNews,
  adminDeleteNews,
  adminPublishNews,
  adminUnpublishNews
};
