const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  // On log un warning, mais on laisse tourner en mode stockage local
  // pour ne pas casser l'environnement de dev.
  console.warn('[Cloudinary] Configuration manquante - les URLs d\'images ne seront pas persistantes.');
}

module.exports = cloudinary;
