const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers s'ils n'existent pas
const audioDir = path.join(__dirname, '../uploads/podcasts/audio');
const coversDir = path.join(__dirname, '../uploads/podcasts/covers');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioDir);
    } else if (file.fieldname === 'cover') {
      cb(null, coversDir);
    } else {
      cb(new Error('Champ de fichier invalide'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (file.fieldname === 'audio') {
      cb(null, `podcast_audio_${uniqueSuffix}_${sanitizedName}${ext}`);
    } else if (file.fieldname === 'cover') {
      cb(null, `podcast_cover_${uniqueSuffix}_${sanitizedName}${ext}`);
    }
  }
});

// Filtre pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    // Accepter les fichiers audio
    const allowedAudioTypes = /mp3|wav|m4a|aac|ogg/;
    const extname = allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /audio/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio (MP3, WAV, M4A, AAC, OGG) sont autorisés'));
    }
  } else if (file.fieldname === 'cover') {
    // Accepter les images
    const allowedImageTypes = /jpeg|jpg|png/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers JPG, PNG sont autorisés pour la couverture'));
    }
  } else {
    cb(new Error('Champ de fichier invalide'));
  }
};

// Configuration de l'upload
const uploadPodcast = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max pour les podcasts
  },
  fileFilter: fileFilter
});

module.exports = uploadPodcast;
