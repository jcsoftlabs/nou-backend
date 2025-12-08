const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../config/upload');

/**
 * @route   POST /auth/register
 * @desc    Inscription d'un nouveau membre avec photo de profil
 * @access  Public
 */
router.post('/register', (req, res, next) => {
  upload.single('photo_profil')(req, res, (err) => {
    if (err) {
      console.error('Erreur upload photo de profil:', err);
      
      let message = 'Erreur lors de l\'upload de la photo de profil';
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'La photo est trop volumineuse. Taille maximale: 5 MB';
      } else if (err.message) {
        message = err.message;
      }
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    next();
  });
}, authController.register);

/**
 * @route   POST /auth/login
 * @desc    Connexion d'un membre (email ou téléphone + mot de passe)
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /auth/send-otp
 * @desc    Envoyer un code OTP par SMS pour vérification
 * @access  Public
 */
router.post('/send-otp', authController.sendOtp);

/**
 * @route   POST /auth/verify-otp
 * @desc    Vérifier un code OTP
 * @access  Public
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @route   POST /auth/verify-nin
 * @desc    Vérifier le NIN pour récupération de mot de passe
 * @access  Public
 */
router.post('/verify-nin', authController.verifyNin);

/**
 * @route   POST /auth/reset-password
 * @desc    Réinitialiser le mot de passe via NIN
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
