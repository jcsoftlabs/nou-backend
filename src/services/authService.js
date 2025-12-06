const bcrypt = require('bcryptjs');
const { Membre } = require('../models');
const { generateTokens } = require('../utils/jwt');
const { generateOTP, saveOTP, verifyOTP, sendOTPSMS } = require('../utils/otp');
const referralService = require('./referralService');

/**
 * Génère un code d'adhésion (code de parrainage) suivant la nouvelle structure :
 * A + 1ère lettre du prénom + 2ème lettre du nom de famille + 4 derniers chiffres du téléphone
 * Exemple : A + J (Jean) + u (Dupont) + 1234 (téléphone) => AJu1234
 */
const generateReferralCodeFromData = async (data) => {
  const prenom = (data.prenom || '').trim();
  const nom = (data.nom || '').trim();
  const telephone = (data.telephone_principal || '').toString();

  // Nettoyage du téléphone pour ne garder que les chiffres
  const digits = telephone.replace(/\D/g, '');

  if (!prenom || !nom || digits.length < 4) {
    throw new Error("Impossible de générer le code d'adhésion : prénom, nom ou téléphone invalide");
  }

  const firstLetterPrenom = prenom[0].toUpperCase();
  const secondLetterNom = nom.length > 1 ? nom[1].toUpperCase() : 'X';
  const last4Phone = digits.slice(-4);

  const baseCode = `A${firstLetterPrenom}${secondLetterNom}${last4Phone}`;

  // On s'assure que le code_adhesion est unique en base.
  // En cas de collision rare, on ajoute un suffixe numérique.
  let code = baseCode;
  let suffix = 0;

  /* eslint-disable no-await-in-loop */
  while (await Membre.findOne({ where: { code_adhesion: code } })) {
    suffix += 1;
    code = `${baseCode}${suffix}`;
  }
  /* eslint-enable no-await-in-loop */

  return code;
};

/**
 * Inscription d'un nouveau membre
 */
const register = async (data) => {
  try {
    // Vérifier si le username existe déjà
    const existingUsername = await Membre.findOne({ where: { username: data.username } });
    if (existingUsername) {
      throw new Error('Ce nom d\'utilisateur est déjà utilisé');
    }
    
    // Vérifier si l'email existe déjà (si fourni)
    if (data.email) {
      const existingEmail = await Membre.findOne({ where: { email: data.email } });
      if (existingEmail) {
        throw new Error('Cet email est déjà utilisé');
      }
    }
    
    // Vérifier si le téléphone existe déjà
    const existingPhone = await Membre.findOne({ 
      where: { telephone_principal: data.telephone_principal } 
    });
    if (existingPhone) {
      throw new Error('Ce numéro de téléphone est déjà utilisé');
    }
    
    // Vérifier si le code_adhesion (code de référence du parrain) existe
    if (data.code_adhesion) {
      const parrain = await Membre.findOne({ 
        where: { code_adhesion: data.code_adhesion } 
      });
      
      if (!parrain) {
        throw new Error('Code de référence invalide');
      }
      
      // Stocker le code parrain pour la logique de referral
      data.code_parrain = data.code_adhesion;
    }
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);
    
    // Générer un nouveau code d'adhésion pour ce membre selon la nouvelle structure
    const nouveau_code_adhesion = await generateReferralCodeFromData(data);
    
    // Préparer les données pour l'insertion
    const membreData = {
      ...data,
      code_adhesion: nouveau_code_adhesion, // Code unique pour ce membre
      password_hash,
      role_utilisateur: 'membre' // Rôle par défaut
    };
    
    // Supprimer le champ password (on garde password_hash)
    delete membreData.password;
    
    // Créer le membre
    const membre = await Membre.create(membreData);
    
    // Si un code parrain est fourni, créer le referral
    if (data.code_parrain) {
      try {
        // Trouver le parrain par son code d'adhésion
        const parrain = await Membre.findOne({ 
          where: { code_adhesion: data.code_parrain } 
        });
        
        if (parrain) {
          // Créer la relation de parrainage
          await referralService.createReferral(parrain.id, membre.id, null);
          console.log(`✅ Referral créé pour ${membre.nom} avec parrain ${parrain.nom}`);
        } else {
          console.warn(`⚠️  Code parrain "${data.code_parrain}" non trouvé`);
        }
      } catch (error) {
        console.error('Erreur lors de la création du referral:', error);
        // On ne bloque pas l'inscription si le referral échoue
      }
    }
    
    // Générer les tokens exactement comme pour la connexion
    const tokens = generateTokens(membre.id, membre.email, membre.role_utilisateur);

    // Retourner la même structure que login() pour permettre l'auto-login côté app mobile
    return {
      membre: {
        id: membre.id,
        username: membre.username,
        code_adhesion: membre.code_adhesion,
        nom: membre.nom,
        prenom: membre.prenom,
        email: membre.email,
        telephone_principal: membre.telephone_principal,
        role: membre.role_utilisateur
      },
      token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Connexion d'un membre
 */
const login = async (identifier, password) => {
  try {
    // Chercher le membre par username, email ou téléphone
    let membre;
    
    if (identifier.includes('@')) {
      // Si contient @, c'est un email
      membre = await Membre.findOne({ where: { email: identifier } });
    } else if (/^[a-zA-Z0-9_]+$/.test(identifier)) {
      // Si contient seulement lettres, chiffres et _, essayer username d'abord
      membre = await Membre.findOne({ where: { username: identifier } });
      
      // Si pas trouvé par username, essayer comme téléphone
      if (!membre) {
        membre = await Membre.findOne({ where: { telephone_principal: identifier } });
      }
    } else {
      // Sinon c'est un téléphone
      membre = await Membre.findOne({ where: { telephone_principal: identifier } });
    }
    
    if (!membre) {
      throw new Error('Identifiants incorrects');
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, membre.password_hash);
    if (!isPasswordValid) {
      throw new Error('Identifiants incorrects');
    }
    
    // Générer les tokens
    const tokens = generateTokens(membre.id, membre.email, membre.role_utilisateur);
    
    return {
      membre: {
        id: membre.id,
        username: membre.username,
        code_adhesion: membre.code_adhesion,
        nom: membre.nom,
        prenom: membre.prenom,
        email: membre.email,
        telephone_principal: membre.telephone_principal,
        role: membre.role_utilisateur
      },
      token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Envoyer un OTP par SMS
 */
const sendOTP = async (telephone) => {
  try {
    // Générer l'OTP
    const otp = generateOTP();
    
    // Sauvegarder l'OTP (valide 10 minutes)
    saveOTP(telephone, otp, 10);
    
    // Envoyer le SMS
    const result = await sendOTPSMS(telephone, otp);
    
    return result;
    
  } catch (error) {
    throw new Error('Erreur lors de l\'envoi de l\'OTP');
  }
};

/**
 * Vérifier un OTP
 */
const verifyOTPCode = async (telephone, otp) => {
  try {
    const isValid = verifyOTP(telephone, otp);
    
    if (!isValid) {
      throw new Error('Code OTP invalide ou expiré');
    }
    
    return { success: true, message: 'OTP vérifié avec succès' };
    
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  sendOTP,
  verifyOTPCode
};
