// Stockage en mémoire des OTP (en production, utiliser Redis)
const otpStore = new Map();

/**
 * Génère un code OTP à 6 chiffres
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sauvegarde un OTP pour un numéro de téléphone
 * @param {string} telephone - Numéro de téléphone
 * @param {string} otp - Code OTP
 * @param {number} expiryMinutes - Durée de validité en minutes (défaut: 10)
 */
const saveOTP = (telephone, otp, expiryMinutes = 10) => {
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
  otpStore.set(telephone, { otp, expiryTime });
  
  // Auto-nettoyage après expiration
  setTimeout(() => {
    otpStore.delete(telephone);
  }, expiryMinutes * 60 * 1000);
};

/**
 * Vérifie un OTP pour un numéro de téléphone
 * @param {string} telephone - Numéro de téléphone
 * @param {string} otp - Code OTP à vérifier
 * @returns {boolean} - True si l'OTP est valide
 */
const verifyOTP = (telephone, otp) => {
  const storedData = otpStore.get(telephone);
  
  if (!storedData) {
    return false; // Pas d'OTP trouvé
  }
  
  if (Date.now() > storedData.expiryTime) {
    otpStore.delete(telephone);
    return false; // OTP expiré
  }
  
  if (storedData.otp !== otp) {
    return false; // OTP incorrect
  }
  
  // OTP valide, on le supprime
  otpStore.delete(telephone);
  return true;
};

/**
 * Envoie un OTP par SMS (simulation)
 * En production, intégrer avec une API SMS (MonCash, Twilio, etc.)
 * @param {string} telephone - Numéro de téléphone
 * @param {string} otp - Code OTP
 */
const sendOTPSMS = async (telephone, otp) => {
  // Simulation d'envoi SMS
  console.log(`📱 [OTP SIMULATION] Envoi OTP au ${telephone}: ${otp}`);
  
  // TODO: En production, remplacer par l'API réelle
  // Exemple avec MonCash ou autre service SMS
  /*
  try {
    await smsProvider.send({
      to: telephone,
      message: `Votre code de vérification NOU est: ${otp}. Valide pendant 10 minutes.`
    });
    return { success: true };
  } catch (error) {
    throw new Error('Erreur lors de l\'envoi du SMS');
  }
  */
  
  return { 
    success: true, 
    message: 'OTP envoyé (simulation)',
    // En mode dev, on retourne l'OTP pour faciliter les tests
    ...(process.env.NODE_ENV === 'development' && { otp })
  };
};

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP,
  sendOTPSMS
};
