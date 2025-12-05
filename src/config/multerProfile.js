const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads/profiles s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Format: profile_userId_timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const userId = req.user ? req.user.id : 'unknown';
    cb(null, `profile_${userId}_${uniqueSuffix}${ext}`);
  }
});

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers JPG, PNG sont autorisés pour les photos de profil'));
  }
};

// Configuration de l'upload
const uploadProfile = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

module.exports = uploadProfile;
