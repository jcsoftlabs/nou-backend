const { verifyToken } = require('../utils/jwt');
const { Membre } = require('../models');

/**
 * Middleware pour vérifier l'authentification JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }
    
    // Format attendu: "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification invalide'
      });
    }
    
    // Vérifier le token
    const decoded = verifyToken(token);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await Membre.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role_utilisateur,
      code_adhesion: user.code_adhesion
    };
    
    next();
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

module.exports = authenticate;
