const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour corriger les problèmes de NIN via SQL direct
 * 1. Génère des NIN temporaires pour les membres sans NIN
 * 2. Résout les doublons de NIN
 */

async function fixNinIssuesSQL() {
  let connection;
  
  try {
    console.log('🔧 Correction des problèmes de NIN...\n');
    
    // Créer la connexion MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connecté à la base de données\n');
    
    let correctionCount = 0;
    
    // 1. Corriger les membres sans NIN
    console.log('📝 Étape 1: Génération de NIN temporaires...\n');
    
    const [membresWithoutNin] = await connection.execute(
      'SELECT id, prenom, nom FROM membres WHERE nin IS NULL OR nin = ""'
    );
    
    if (membresWithoutNin.length > 0) {
      console.log(`Trouvé ${membresWithoutNin.length} membre(s) sans NIN`);
      
      for (const membre of membresWithoutNin) {
        const tempNin = `TEMP-${membre.id}-${Date.now()}`;
        
        await connection.execute(
          'UPDATE membres SET nin = ? WHERE id = ?',
          [tempNin, membre.id]
        );
        
        console.log(`✅ Membre ID ${membre.id} (${membre.prenom} ${membre.nom}): NIN temporaire = ${tempNin}`);
        correctionCount++;
        
        // Petit délai pour garantir l'unicité du timestamp
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log(`\n✅ ${membresWithoutNin.length} NIN temporaire(s) généré(s)\n`);
      console.log('⚠️  IMPORTANT: Ces NIN temporaires doivent être remplacés par les vrais NIN!\n');
    } else {
      console.log('✅ Tous les membres ont déjà un NIN\n');
    }
    
    // 2. Corriger les doublons de NIN
    console.log('📝 Étape 2: Résolution des doublons de NIN...\n');
    
    const [duplicates] = await connection.execute(`
      SELECT nin, COUNT(*) as count 
      FROM membres 
      WHERE nin IS NOT NULL AND nin != ''
      GROUP BY nin 
      HAVING count > 1
    `);
    
    if (duplicates.length > 0) {
      console.log(`Trouvé ${duplicates.length} NIN en doublon`);
      
      for (const dup of duplicates) {
        const [membres] = await connection.execute(
          'SELECT id, prenom, nom FROM membres WHERE nin = ? ORDER BY id ASC',
          [dup.nin]
        );
        
        console.log(`\n🔍 NIN "${dup.nin}" utilisé ${membres.length} fois:`);
        
        // Garder le premier, modifier les autres
        for (let i = 1; i < membres.length; i++) {
          const membre = membres[i];
          const newNin = `${dup.nin}-DUP${i}`;
          
          await connection.execute(
            'UPDATE membres SET nin = ? WHERE id = ?',
            [newNin, membre.id]
          );
          
          console.log(`  ✅ Membre ID ${membre.id} (${membre.prenom} ${membre.nom}): NIN changé en ${newNin}`);
          correctionCount++;
        }
        
        console.log(`  ℹ️  Membre ID ${membres[0].id} (${membres[0].prenom} ${membres[0].nom}): NIN original conservé`);
      }
      
      console.log(`\n✅ ${duplicates.length} doublon(s) résolu(s)\n`);
      console.log('⚠️  IMPORTANT: Corrigez ces NIN avec les vraies valeurs!\n');
    } else {
      console.log('✅ Aucun doublon de NIN détecté\n');
    }
    
    // Résumé
    console.log('=' .repeat(50));
    console.log('RÉSUMÉ DES CORRECTIONS:');
    console.log('=' .repeat(50));
    console.log(`Total de corrections effectuées: ${correctionCount}`);
    console.log(`NIN temporaires générés: ${membresWithoutNin.length}`);
    console.log(`Doublons résolus: ${duplicates.length}`);
    
    if (correctionCount > 0) {
      console.log('\n✅ Toutes les corrections ont été effectuées!');
      console.log('⚠️  N\'oubliez pas de corriger les NIN temporaires avec les vraies valeurs.');
      console.log('\n📝 Prochaine étape:');
      console.log('   Exécutez la migration SQL: src/migrations/012_make_nin_required.sql');
    } else {
      console.log('\n✅ Aucune correction nécessaire!');
      console.log('La base de données est prête pour la migration.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
fixNinIssuesSQL()
  .then(() => {
    console.log('\n✅ Script de correction terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });
