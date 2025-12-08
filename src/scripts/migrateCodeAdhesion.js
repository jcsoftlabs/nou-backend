const dotenv = require('dotenv');
dotenv.config();

const { sequelize, Membre } = require('../models');

/**
 * Génère un code d'adhésion en mémoire suivant la nouvelle structure :
 * A + 1ère lettre du prénom + 1ère lettre du nom de famille + 4 derniers chiffres du téléphone
 * Exemple : A + J (Jean) + D (Dupont) + 1234 => AJD1234
 */
const generateCodeAdhesionLocal = (usedCodes, membre) => {
  const prenom = (membre.prenom || '').trim();
  const nom = (membre.nom || '').trim();
  const telephone = (membre.telephone_principal || '').toString();

  const digits = telephone.replace(/\D/g, '');

  if (!prenom || !nom || digits.length < 4) {
    throw new Error(`Impossible de générer le code d'adhésion pour le membre id=${membre.id} : prénom, nom ou téléphone invalide`);
  }

  const firstLetterPrenom = prenom[0].toUpperCase();
  const firstLetterNom = nom[0].toUpperCase();
  const last4Phone = digits.slice(-4);

  const baseCode = `A${firstLetterPrenom}${firstLetterNom}${last4Phone}`;

  let code = baseCode;
  let suffix = 0;
  while (usedCodes.has(code)) {
    suffix += 1;
    code = `${baseCode}${suffix}`;
  }

  usedCodes.add(code);
  return code;
};

async function migrateCodes() {
  console.log('🔄 Démarrage de la migration des codes d\'adhésion...');

  const membres = await Membre.findAll({
    attributes: ['id', 'username', 'nom', 'prenom', 'telephone_principal', 'code_adhesion', 'code_parrain']
  });

  console.log(`👥 Membres trouvés: ${membres.length}`);

  const usedCodes = new Set();
  const oldToNew = {};

  // Première passe : générer un nouveau code pour chaque membre avec la nouvelle structure
  for (const membre of membres) {
    const oldCode = membre.code_adhesion;
    const newCode = generateCodeAdhesionLocal(usedCodes, membre);
    oldToNew[oldCode] = newCode;
  }

  // Vérification rapide
  console.log('📋 Aperçu de la correspondance anciens -> nouveaux codes (max 10):');
  Object.entries(oldToNew)
    .slice(0, 10)
    .forEach(([oldCode, newCode]) => {
      console.log(`  ${oldCode}  ->  ${newCode}`);
    });

  await sequelize.transaction(async (t) => {
    console.log('\n✏️ Mise à jour des code_adhesion...');

    // Mettre à jour les code_adhesion de tous les membres
    for (const membre of membres) {
      const oldCode = membre.code_adhesion;
      const newCode = oldToNew[oldCode];

      await Membre.update(
        { code_adhesion: newCode },
        { where: { id: membre.id }, transaction: t }
      );
    }

    console.log('✏️ Mise à jour des code_parrain pour conserver les liens...');

    // Mettre à jour les code_parrain pour pointer vers les nouveaux codes des parrains
    for (const membre of membres) {
      const oldParrainCode = membre.code_parrain;
      if (!oldParrainCode) continue;

      const newParrainCode = oldToNew[oldParrainCode];
      if (!newParrainCode) {
        console.warn(`⚠️ Aucun nouveau code trouvé pour le parrain "${oldParrainCode}" (membre id=${membre.id}). Code_parrain laissé tel quel.`);
        continue;
      }

      await Membre.update(
        { code_parrain: newParrainCode },
        { where: { id: membre.id }, transaction: t }
      );
    }
  });

  console.log('\n✅ Migration terminée avec succès.');
  console.log('ℹ️ Tous les membres ont un nouveau code_adhesion au format complexe,');
  console.log('   et les champs code_parrain ont été mis à jour pour pointer vers ces nouveaux codes.');
}

if (require.main === module) {
  migrateCodes()
    .then(() => {
      console.log('\n✨ Script migrateCodeAdhesion terminé.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n💥 Erreur lors de la migration des codes d\'adhésion:', err);
      process.exit(1);
    });
}

module.exports = migrateCodes;
