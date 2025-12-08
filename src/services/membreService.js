const bcrypt = require('bcryptjs');
const { Membre, AuditLog } = require('../models');

/**
 * Génère un code d'adhésion (code de parrainage) suivant la nouvelle structure :
 * A + 1ère lettre du prénom + 1ère lettre du nom de famille + 4 derniers chiffres du téléphone
 * Exemple : A + J (Jean) + D (Dupont) + 1234 (téléphone) => AJD1234
 */
const generateReferralCodeFromData = async (data) => {
  const prenom = (data.prenom || '').trim();
  const nom = (data.nom || '').trim();
  const telephone = (data.telephone_principal || '').toString();

  const digits = telephone.replace(/\D/g, '');

  if (!prenom || !nom || digits.length < 4) {
    throw new Error("Impossible de générer le code d'adhésion : prénom, nom ou téléphone invalide");
  }

  const firstLetterPrenom = prenom[0].toUpperCase();
  const firstLetterNom = nom[0].toUpperCase();
  const last4Phone = digits.slice(-4);

  const baseCode = `A${firstLetterPrenom}${firstLetterNom}${last4Phone}`;

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
 * Loguer une action dans la table audit
 */
const logAudit = async (userId, action, entityType, entityId, description, dataBefore, dataAfter, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      data_before: dataBefore,
      data_after: dataAfter,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Erreur lors du logging audit:', error);
  }
};

/**
 * Créer ou modifier un membre (par admin)
 */
const createOrUpdateMembre = async (data, adminUser, req) => {
  try {
    const isUpdate = !!data.id;
    let membre = null;
    let dataBefore = null;
    
    if (isUpdate) {
      // Modification d'un membre existant
      membre = await Membre.findByPk(data.id);
      
      if (!membre) {
        throw new Error('Membre non trouvé');
      }
      
      // Sauvegarder les données avant modification
      dataBefore = membre.toJSON();
      delete dataBefore.password_hash;
      
      // Préparer les données à mettre à jour
      const updateData = { ...data };
      delete updateData.id;
      
      // Hash le nouveau mot de passe si fourni
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(data.password, salt);
        delete updateData.password;
      }
      
      // Mettre à jour le membre
      await membre.update(updateData);
      await membre.reload();
      
      // Logger l'action
      const dataAfter = membre.toJSON();
      delete dataAfter.password_hash;
      
      await logAudit(
        adminUser.id,
        'UPDATE_MEMBRE',
        'membre',
        membre.id,
        `Modification du membre ${membre.nom} ${membre.prenom} par admin`,
        dataBefore,
        dataAfter,
        req
      );
      
    } else {
      // Création d'un nouveau membre
      
      // Vérifier l'unicité de l'email
      if (data.email) {
        const existingEmail = await Membre.findOne({ where: { email: data.email } });
        if (existingEmail) {
          throw new Error('Cet email est déjà utilisé');
        }
      }
      
      // Vérifier l'unicité du téléphone
      const existingPhone = await Membre.findOne({ 
        where: { telephone_principal: data.telephone_principal } 
      });
      if (existingPhone) {
        throw new Error('Ce numéro de téléphone est déjà utilisé');
      }
      
      // Hash le mot de passe
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(data.password, salt);
      
      // Générer le code d'adhésion (code de parrainage) si non fourni, selon la nouvelle structure
      const code_adhesion = data.code_adhesion || await generateReferralCodeFromData(data);
      
      // Préparer les données
      const membreData = {
        ...data,
        code_adhesion,
        password_hash
      };
      delete membreData.password;
      delete membreData.id;
      
      // Créer le membre
      membre = await Membre.create(membreData);
      
      // Logger l'action
      const dataAfter = membre.toJSON();
      delete dataAfter.password_hash;
      
      await logAudit(
        adminUser.id,
        'CREATE_MEMBRE',
        'membre',
        membre.id,
        `Création du membre ${membre.nom} ${membre.prenom} par admin`,
        null,
        dataAfter,
        req
      );
    }
    
    // Retourner le membre sans le hash du mot de passe
    const result = membre.toJSON();
    delete result.password_hash;
    
    return result;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer un membre par son ID
 */
const getMembreById = async (id) => {
  try {
    const membre = await Membre.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!membre) {
      throw new Error('Membre non trouvé');
    }
    
    return membre;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Mettre à jour son propre profil (membre connecté)
 * Restreint les champs que l'utilisateur peut modifier lui-même
 */
const updateOwnProfile = async (userId, data, req) => {
  try {
    const membre = await Membre.findByPk(userId);
    
    if (!membre) {
      throw new Error('Membre non trouvé');
    }
    
    // Sauvegarder les données avant modification
    const dataBefore = membre.toJSON();
    delete dataBefore.password_hash;
    
    // Liste des champs que l'utilisateur peut modifier lui-même
    const allowedFields = [
      'surnom',
      'photo_profil_url',
      'adresse_complete',
      'facebook',
      'instagram',
      'telephone_etranger',
      'email'
    ];
    
    // Filtrer les données pour ne garder que les champs autorisés
    const updateData = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Si un email est fourni, vérifier qu'il n'est pas déjà utilisé
    if (updateData.email && updateData.email !== membre.email) {
      const existingEmail = await Membre.findOne({ 
        where: { email: updateData.email } 
      });
      if (existingEmail) {
        throw new Error('Cet email est déjà utilisé');
      }
    }
    
    // Gérer le changement de mot de passe (si fourni)
    if (data.password && data.old_password) {
      // Vérifier l'ancien mot de passe
      const isPasswordValid = await bcrypt.compare(data.old_password, membre.password_hash);
      if (!isPasswordValid) {
        throw new Error('Ancien mot de passe incorrect');
      }
      
      // Hash le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(data.password, salt);
    }
    
    // Mettre à jour
    await membre.update(updateData);
    await membre.reload();
    
    // Logger l'action
    const dataAfter = membre.toJSON();
    delete dataAfter.password_hash;
    
    await logAudit(
      userId,
      'UPDATE_OWN_PROFILE',
      'membre',
      membre.id,
      `Mise à jour du profil par le membre ${membre.nom} ${membre.prenom}`,
      dataBefore,
      dataAfter,
      req
    );
    
    // Retourner le membre sans le hash du mot de passe
    const result = membre.toJSON();
    delete result.password_hash;
    
    return result;
    
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createOrUpdateMembre,
  getMembreById,
  updateOwnProfile
};
