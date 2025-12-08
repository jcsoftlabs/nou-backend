const { Membre } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * Script pour corriger automatiquement les problèmes de NIN
 * 1. Génère des NIN temporaires pour les membres sans NIN
 * 2. Résout les doublons de NIN en ajoutant un suffixe
 */

async function fixNinIssues() {
  try {
    console.log('🔧 Correction des problèmes de NIN...\n');
    
    let correctionCount = 0;
    
    // 1. Corriger les membres sans NIN
    console.log('📝 Étape 1: Génération de NIN temporaires pour les membres sans NIN...\n');
    
    const membresWithoutNin = await Membre.findAll({
      where: {
        [Sequelize.Op.or]: [
          { nin: null },
          { nin: '' }
        ]
      }
    });
    
    if (membresWithoutNin.length > 0) {
      console.log(`Trouvé ${membresWithoutNin.length} membre(s) sans NIN`);
      
      for (const membre of membresWithoutNin) {
        // Générer un NIN temporaire unique
        const tempNin = `TEMP-${membre.id}-${Date.now()}`;
        
        await membre.update({ nin: tempNin });
        
        console.log(`✅ Membre ID ${membre.id} (${membre.prenom} ${membre.nom}): NIN temporaire généré: ${tempNin}`);
        correctionCount++;
      }
      
      console.log(`\n✅ ${membresWithoutNin.length} NIN temporaire(s) généré(s)\n`);
      console.log('⚠️  IMPORTANT: Ces NIN temporaires doivent être remplacés par les vrais NIN ultérieurement!\n');
    } else {
      console.log('✅ Tous les membres ont déjà un NIN\n');
    }
    
    // 2. Corriger les doublons de NIN
    console.log('📝 Étape 2: Résolution des doublons de NIN...\n');
    
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
      console.log(`Trouvé ${ninGroups.length} NIN en doublon`);
      
      for (const group of ninGroups) {
        const duplicates = await Membre.findAll({
          where: { nin: group.nin },
          order: [['id', 'ASC']]
        });
        
        console.log(`\n🔍 NIN "${group.nin}" utilisé ${duplicates.length} fois:`);
        
        // Garder le premier, modifier les autres
        for (let i = 1; i < duplicates.length; i++) {
          const membre = duplicates[i];
          const newNin = `${group.nin}-DUP${i}`;
          
          await membre.update({ nin: newNin });
          
          console.log(`  ✅ Membre ID ${membre.id} (${membre.prenom} ${membre.nom}): NIN changé en ${newNin}`);
          correctionCount++;
        }
        
        console.log(`  ℹ️  Membre ID ${duplicates[0].id} (${duplicates[0].prenom} ${duplicates[0].nom}): NIN original conservé`);
      }
      
      console.log(`\n✅ ${ninGroups.length} doublon(s) résolu(s)\n`);
      console.log('⚠️  IMPORTANT: Vérifiez ces membres et corrigez leurs NIN avec les vraies valeurs!\n');
    } else {
      console.log('✅ Aucun doublon de NIN détecté\n');
    }
    
    // Résumé
    console.log('=' .repeat(50));
    console.log('RÉSUMÉ DES CORRECTIONS:');
    console.log('=' .repeat(50));
    console.log(`Total de corrections effectuées: ${correctionCount}`);
    console.log(`NIN temporaires générés: ${membresWithoutNin.length}`);
    console.log(`Doublons résolus: ${ninGroups.length}`);
    
    if (correctionCount > 0) {
      console.log('\n✅ Toutes les corrections ont été effectuées avec succès!');
      console.log('⚠️  N\'oubliez pas de corriger les NIN temporaires avec les vraies valeurs.');
      console.log('\nVous pouvez maintenant exécuter la migration 012_make_nin_required.sql');
    } else {
      console.log('\n✅ Aucune correction nécessaire, la base de données est prête!');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixNinIssues()
    .then(() => {
      console.log('\n✅ Script de correction terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { fixNinIssues };
