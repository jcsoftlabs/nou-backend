const membreService = require('../services/membreService');
const { createOrUpdateMembreSchema } = require('../validators/membreValidators');

/**
 * POST /membres
 * Créer ou modifier un membre (admin seulement)
 */
const createOrUpdateMembre = async (req, res) => {
  try {
    // Valider les données avec Joi
    const { error, value } = createOrUpdateMembreSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    // Appeler le service
    const result = await membreService.createOrUpdateMembre(value, req.user, req);
    
    const isUpdate = !!value.id;
    
    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Membre modifié avec succès' : 'Membre créé avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la création/modification du membre:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création/modification du membre'
    });
  }
};

/**
 * GET /membres/:id
 * Récupérer un membre par son ID
 */
const getMembre = async (req, res) => {
  try {
    const { id } = req.params;
    const membre = await membreService.getMembreById(id);
    
    return res.status(200).json({
      success: true,
      message: 'Membre récupéré avec succès',
      data: membre
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    return res.status(404).json({
      success: false,
      message: error.message || 'Membre non trouvé'
    });
  }
};

/**
 * PUT /membres/me - Mettre à jour son propre profil
 */
const updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await membreService.updateOwnProfile(userId, req.body, req);
    
    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du profil'
    });
  }
};

/**
 * POST /membres/me/photo - Upload photo de profil
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    // Construire l'URL de la photo
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Mettre à jour le profil avec la nouvelle photo
    const result = await membreService.updateOwnProfile(
      userId, 
      { photo_profil_url: photoUrl },
      req
    );
    
    return res.status(200).json({
      success: true,
      message: 'Photo de profil uploadée avec succès',
      data: {
        photo_profil_url: photoUrl,
        membre: result
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo de profil:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'upload de la photo de profil'
    });
  }
};

/**
 * GET /membres/me - Obtenir son propre profil
 */
const getOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const membre = await membreService.getMembreById(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Profil récupéré avec succès',
      data: membre
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(404).json({
      success: false,
      message: error.message || 'Profil non trouvé'
    });
  }
};

module.exports = {
  createOrUpdateMembre,
  getMembre,
  updateOwnProfile,
  uploadProfilePhoto,
  getOwnProfile
};
