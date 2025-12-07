const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier s'il n'existe pas
const formationDir = path.join(__dirname, '../uploads/formations');

if (!fs.existsSync(formationDir)) {
  fs.mkdirSync(formationDir, { recursive: true });
}

// Configuration du stockage temporaire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, formationDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    const prefix = `formation_${file.fieldname}_${uniqueSuffix}`;
    cb(null, `${prefix}_${sanitizedName}${ext}`);
  }
});

// Filtre pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // PDF
  if (file.fieldname === 'pdf') {
    if (ext === '.pdf' && file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    return cb(new Error('Seuls les fichiers PDF sont autorisés pour ce champ'));
  }
  
  // PowerPoint
  if (file.fieldname === 'ppt') {
    const allowedPptTypes = ['.ppt', '.pptx'];
    const allowedMimetypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedPptTypes.includes(ext) && allowedMimetypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Seuls les fichiers PowerPoint (PPT, PPTX) sont autorisés pour ce champ'));
  }
  
  // Vidéo
  if (file.fieldname === 'video') {
    const allowedVideoTypes = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const isVideoMimetype = file.mimetype.startsWith('video/');
    
    if (allowedVideoTypes.includes(ext) && isVideoMimetype) {
      return cb(null, true);
    }
    return cb(new Error('Seuls les fichiers vidéo (MP4, MOV, AVI, MKV, WEBM) sont autorisés'));
  }
  
  // Image
  if (file.fieldname === 'image') {
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const isImageMimetype = file.mimetype.startsWith('image/');
    
    if (allowedImageTypes.includes(ext) && isImageMimetype) {
      return cb(null, true);
    }
    return cb(new Error('Seuls les fichiers image (JPG, PNG, GIF, WEBP) sont autorisés'));
  }
  
  // Fichiers supplémentaires (array)
  if (file.fieldname === 'fichiers') {
    const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'];
    const allowedMimetypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime'
    ];
    
    if (allowedTypes.includes(ext) && allowedMimetypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Type de fichier non autorisé'));
  }
  
  cb(new Error('Champ de fichier invalide'));
};

// Configuration de l'upload avec limites de taille
const uploadFormation = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max (pour vidéos)
  },
  fileFilter: fileFilter
});

module.exports = uploadFormation;
