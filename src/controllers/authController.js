const authService = require('../services/authService');
const {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  verifyNinSchema,
  resetPasswordSchema
} = require('../validators/authValidators');

/**
 * POST /auth/register
 * Inscription d'un nouveau membre avec photo de profil
 */
const register = async (req, res) => {
  try {
    // Convertir les booléens (envoyés comme strings dans FormData)
    const formData = { ...req.body };
    
    // Conversion des booléens
    ['a_ete_membre_politique', 'a_ete_membre_organisation', 'a_ete_condamne', 
     'a_violé_loi_drogue', 'a_participe_activite_terroriste'].forEach(field => {
      if (formData[field] !== undefined) {
        formData[field] = formData[field] === 'true' || formData[field] === true;
      }
    });
    
    // Conversion des entiers
    ['nb_enfants', 'nb_personnes_a_charge'].forEach(field => {
      if (formData[field] !== undefined && formData[field] !== '') {
        formData[field] = parseInt(formData[field], 10);
      }
    });
    
    // Si un fichier a été uploadé, ajouter le chemin relatif
    if (req.file) {
      formData.photo_profil_url = `/uploads/profils/${req.file.filename}`;
    }
    
    // Valider les données avec Joi
    const { error, value } = registerSchema.validate(formData, { 
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
    
    // Appeler le service d'inscription
    const result = await authService.register(value);
    
    return res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'inscription'
    });
  }
};

/**
 * POST /auth/login
 * Connexion d'un membre
 */
const login = async (req, res) => {
  try {
    // Valider les données avec Joi
    const { error, value } = loginSchema.validate(req.body);
    
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
    
    // Appeler le service de connexion
    const result = await authService.login(value.identifier, value.password);
    
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Erreur lors de la connexion'
    });
  }
};

/**
 * POST /auth/send-otp
 * Envoyer un code OTP par SMS
 */
const sendOtp = async (req, res) => {
  try {
    // Valider les données avec Joi
    const { error, value } = sendOtpSchema.validate(req.body);
    
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
    
    // Appeler le service d'envoi OTP
    const result = await authService.sendOTP(value.telephone);
    
    return res.status(200).json({
      success: true,
      message: 'OTP envoyé avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'envoi de l\'OTP'
    });
  }
};

/**
 * POST /auth/verify-otp
 * Vérifier un code OTP
 */
const verifyOtp = async (req, res) => {
  try {
    // Valider les données avec Joi
    const { error, value } = verifyOtpSchema.validate(req.body);
    
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
    
    // Appeler le service de vérification OTP
    const result = await authService.verifyOTPCode(value.telephone, value.otp);
    
    return res.status(200).json({
      success: true,
      message: 'OTP vérifié avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'OTP:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la vérification de l\'OTP'
    });
  }
};

/**
 * POST /auth/verify-nin
 * Vérifier le NIN pour la récupération de mot de passe
 */
const verifyNin = async (req, res) => {
  try {
    // Valider les données avec Joi
    const { error, value } = verifyNinSchema.validate(req.body);
    
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
    
    // Appeler le service de vérification NIN
    const result = await authService.verifyNIN(value.nin);
    
    return res.status(200).json({
      success: true,
      message: 'NIN vérifié avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification du NIN:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la vérification du NIN'
    });
  }
};

/**
 * POST /auth/reset-password
 * Réinitialiser le mot de passe via NIN
 */
const resetPassword = async (req, res) => {
  try {
    // Valider les données avec Joi
    const { error, value } = resetPasswordSchema.validate(req.body);
    
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
    
    // Appeler le service de réinitialisation de mot de passe
    const result = await authService.resetPassword(value.nin, value.new_password);
    
    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  verifyNin,
  resetPassword
};
