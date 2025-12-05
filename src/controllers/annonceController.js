const annonceService = require('../services/annonceService');

// Public: annonces actives
const getPublicAnnonces = async (req, res) => {
  try {
    const annonces = await annonceService.getActiveAnnonces();

    return res.status(200).json({
      success: true,
      message: 'Annonces actives récupérées avec succès',
      data: annonces
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces actives:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des annonces'
    });
  }
};

// Admin: liste complète
const adminGetAnnonces = async (req, res) => {
  try {
    const { page, limit, statut, priorite } = req.query;
    const result = await annonceService.getAllAnnonces({
      page,
      limit,
      statut,
      priorite
    });

    return res.status(200).json({
      success: true,
      message: 'Annonces récupérées avec succès',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Erreur admin lors de la récupération des annonces:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des annonces'
    });
  }
};

// Admin: créer une annonce
const adminCreateAnnonce = async (req, res) => {
  try {
    const data = req.body;

    if (!data.titre || !data.message) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et le message sont obligatoires'
      });
    }

    const annonce = await annonceService.createAnnonce(data, req.user?.id || null);

    return res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      data: annonce
    });
  } catch (error) {
    console.error('Erreur lors de la création d\'une annonce:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'annonce'
    });
  }
};

// Admin: mise à jour
const adminUpdateAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const annonce = await annonceService.updateAnnonce(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      data: annonce
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'annonce:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de l\'annonce'
    });
  }
};

// Admin: changer le statut
const adminChangeAnnonceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut) {
      return res.status(400).json({
        success: false,
        message: 'Le statut est obligatoire'
      });
    }

    const annonce = await annonceService.changeAnnonceStatus(id, statut);

    return res.status(200).json({
      success: true,
      message: 'Statut de l\'annonce mis à jour avec succès',
      data: annonce
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut de l\'annonce:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du changement de statut de l\'annonce'
    });
  }
};

module.exports = {
  getPublicAnnonces,
  adminGetAnnonces,
  adminCreateAnnonce,
  adminUpdateAnnonce,
  adminChangeAnnonceStatus
};
