const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRE = '24h';
const REFRESH_TOKEN_EXPIRE = '7d';

/**
 * Génère un access token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Génère un refresh token JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
};

/**
 * Vérifie un token JWT
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

/**
 * Génère les deux tokens (access et refresh)
 */
const generateTokens = (userId, email, role) => {
  const payload = {
    id: userId,
    email,
    role
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokens
};
