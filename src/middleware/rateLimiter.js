const rateLimit = require('express-rate-limit');

/**
 * Helper pour générer une clé compatible IPv4 et IPv6
 */
const generateKey = (req) => {
  // Si utilisateur authentifié, utiliser son ID
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  // Sinon utiliser l'IP (express-rate-limit gère IPv6 automatiquement)
  return req.ip;
};

/**
 * Rate limiter pour les endpoints de paiement
 * Limite à 10 requêtes par 15 minutes par IP
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 requêtes
  message: {
    success: false,
    message: 'Trop de tentatives de paiement. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Rate limiter plus strict pour les validations admin
 * Limite à 30 requêtes par 10 minutes
 */
const adminValidationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Maximum 30 requêtes
  message: {
    success: false,
    message: 'Trop de validations. Veuillez ralentir.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter général pour les routes publiques
 * Limite à 100 requêtes par 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  paymentLimiter,
  adminValidationLimiter,
  generalLimiter
};
