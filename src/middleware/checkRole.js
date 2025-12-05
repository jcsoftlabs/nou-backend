/**
 * Middleware pour vérifier que l'utilisateur a le(s) rôle(s) requis
 * @param {string|Array<string>} allowedRoles - Rôle(s) autorisé(s)
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }
      
      // Convertir en tableau si c'est une chaîne
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // Vérifier si l'utilisateur a l'un des rôles autorisés
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Permissions insuffisantes.'
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Erreur de vérification des rôles:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  };
};

module.exports = checkRole;
