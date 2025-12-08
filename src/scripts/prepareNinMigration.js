const { Membre } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * Script pour préparer la migration du champ NIN
 * 1. Vérifie combien de membres n'ont pas de NIN
 * 2. Génère des NIN temporaires pour les membres qui n'en ont pas
 * 3. Vérifie les doublons de NIN existants
 */

async function prepareNinMigration() {
  try {
    console.log('🔍 Vérification de l\'état actuel de la base de données...\n');
    
    // Compter le total de membres
    const totalMembres = await Membre.count();
    console.log(`📊 Total de membres: ${totalMembres}`);
    
    // Compter les membres sans NIN
    const membresWithoutNin = await Membre.count({
      where: {
        [Sequelize.Op.or]: [
          { nin: null },
          { nin: '' }
        ]
      }
    });
    console.log(`⚠️  Membres sans NIN: ${membresWithoutNin}`);
    
    // Compter les membres avec NIN
    const membresWithNin = totalMembres - membresWithoutNin;
    console.log(`✅ Membres avec NIN: ${membresWithNin}\n`);
    
    if (membresWithoutNin > 0) {
      console.log('🔧 Correction nécessaire: Génération de NIN temporaires...\n');
      
      // Récupérer les membres sans NIN
      const membresACorreger = await Membre.findAll({
        where: {
          [Sequelize.Op.or]: [
            { nin: null },
            { nin: '' }
          ]
        }
      });
      
      console.log('📋 Liste des membres sans NIN:');
      console.log('-----------------------------------');
      
      for (const membre of membresACorreger) {
        console.log(`ID: ${membre.id} | ${membre.prenom} ${membre.nom} | Téléphone: ${membre.telephone_principal}`);
      }
      
      console.log('\n⚠️  ACTION REQUISE:');
      console.log('Ces membres doivent avoir un NIN avant de rendre le champ obligatoire.');
      console.log('Vous avez deux options:');
      console.log('  1. Contacter ces membres pour obtenir leur vrai NIN');
      console.log('  2. Générer des NIN temporaires (format: TEMP-[ID]-[TIMESTAMP])');
      console.log('\nVoulez-vous générer des NIN temporaires? (à corriger ultérieurement)\n');
    }
    
    // Vérifier les doublons de NIN existants
    console.log('🔍 Vérification des doublons de NIN...\n');
    
    const ninGroups = await Membre.findAll({
      attributes: [
        'nin',
        [Sequelize.fn('COUNT', Sequelize.col('nin')), 'count']
      ],
      where: {
        nin: {
          [Sequelize.Op.ne]: null,
          [Sequelize.Op.ne]: ''
        }
      },
      group: ['nin'],
      having: Sequelize.literal('count > 1'),
      raw: true
    });
    
    if (ninGroups.length > 0) {
      console.log('⚠️  ATTENTION: Doublons de NIN détectés!');
      console.log('-----------------------------------');
      for (const group of ninGroups) {
        console.log(`NIN "${group.nin}" utilisé ${group.count} fois`);
        
        // Afficher les membres avec ce NIN
        const duplicates = await Membre.findAll({
          where: { nin: group.nin }
        });
        
        for (const membre of duplicates) {
          console.log(`  - ID: ${membre.id} | ${membre.prenom} ${membre.nom}`);
        }
      }
      console.log('\n⚠️  Ces doublons doivent être corrigés avant la migration!\n');
    } else {
      console.log('✅ Aucun doublon de NIN détecté\n');
    }
    
    // Résumé
    console.log('=' .repeat(50));
    console.log('RÉSUMÉ:');
    console.log('=' .repeat(50));
    console.log(`Total membres: ${totalMembres}`);
    console.log(`Membres sans NIN: ${membresWithoutNin}`);
    console.log(`Doublons de NIN: ${ninGroups.length}`);
    
    if (membresWithoutNin === 0 && ninGroups.length === 0) {
      console.log('\n✅ La base de données est prête pour la migration!');
      console.log('Vous pouvez exécuter la migration 012_make_nin_required.sql');
    } else {
      console.log('\n⚠️  La base de données nécessite des corrections avant la migration.');
      console.log('Exécutez le script fixNinIssues.js pour corriger automatiquement.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  prepareNinMigration()
    .then(() => {
      console.log('\n✅ Vérification terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { prepareNinMigration };
