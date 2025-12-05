const admin = require('firebase-admin');
const path = require('path');

/**
 * Initialise Firebase Admin SDK
 * 
 * IMPORTANT: Vous devez placer votre fichier de clé privée Firebase
 * dans le dossier config/ avec le nom 'firebase-service-account.json'
 * 
 * Pour obtenir ce fichier:
 * 1. Allez sur Firebase Console > Paramètres du projet > Comptes de service
 * 2. Cliquez sur "Générer une nouvelle clé privée"
 * 3. Sauvegardez le fichier JSON dans src/config/firebase-service-account.json
 */

let firebaseApp;

try {
  // Vérifier si une variable d'environnement pointe vers le fichier de credentials
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    || path.join(__dirname, 'firebase-service-account.json');
  
  const serviceAccount = require(serviceAccountPath);
  
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  console.log('✅ Firebase Admin SDK initialisé avec succès');
} catch (error) {
  console.error('⚠️ Erreur lors de l\'initialisation de Firebase Admin SDK:', error.message);
  console.error('Les notifications push ne seront pas disponibles.');
  console.error('Veuillez configurer le fichier firebase-service-account.json dans src/config/');
}

/**
 * Obtenir l'instance Firebase Messaging
 */
const getMessaging = () => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK n\'est pas initialisé');
  }
  return admin.messaging();
};

/**
 * Vérifier si Firebase est configuré
 */
const isFirebaseConfigured = () => {
  return !!firebaseApp;
};

module.exports = {
  admin,
  getMessaging,
  isFirebaseConfigured
};
