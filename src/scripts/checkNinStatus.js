const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script léger pour vérifier l'état des NIN directement via MySQL
 * Sans dépendre du modèle Sequelize qui pourrait avoir des colonnes non migrées
 */

async function checkNinStatus() {
  let connection;
  
  try {
    console.log('🔍 Connexion à la base de données...\n');
    
    // Créer la connexion MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connecté à la base de données\n');
    console.log('🔍 Vérification de l\'état actuel des NIN...\n');
    
    // Compter le total de membres
    const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM membres');
    const totalMembres = totalResult[0].total;
    console.log(`📊 Total de membres: ${totalMembres}`);
    
    // Compter les membres sans NIN (NULL ou vide)
    const [withoutNinResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM membres WHERE nin IS NULL OR nin = ""'
    );
    const membresWithoutNin = withoutNinResult[0].total;
    console.log(`⚠️  Membres sans NIN: ${membresWithoutNin}`);
    
    // Compter les membres avec NIN
    const membresWithNin = totalMembres - membresWithoutNin;
    console.log(`✅ Membres avec NIN: ${membresWithNin}\n`);
    
    if (membresWithoutNin > 0) {
      console.log('📋 Liste des membres sans NIN:');
      console.log('-----------------------------------');
      
      const [membres] = await connection.execute(
        'SELECT id, prenom, nom, telephone_principal FROM membres WHERE nin IS NULL OR nin = ""'
      );
      
      for (const membre of membres) {
        console.log(`ID: ${membre.id} | ${membre.prenom} ${membre.nom} | Téléphone: ${membre.telephone_principal}`);
      }
      
      console.log('\n⚠️  ACTION REQUISE:');
      console.log('Ces membres doivent avoir un NIN avant de rendre le champ obligatoire.');
    }
    
    // Vérifier les doublons de NIN
    console.log('\n🔍 Vérification des doublons de NIN...\n');
    
    const [duplicates] = await connection.execute(`
      SELECT nin, COUNT(*) as count 
      FROM membres 
      WHERE nin IS NOT NULL AND nin != ''
      GROUP BY nin 
      HAVING count > 1
    `);
    
    if (duplicates.length > 0) {
      console.log('⚠️  ATTENTION: Doublons de NIN détectés!');
      console.log('-----------------------------------');
      
      for (const dup of duplicates) {
        console.log(`\nNIN "${dup.nin}" utilisé ${dup.count} fois`);
        
        const [membres] = await connection.execute(
          'SELECT id, prenom, nom FROM membres WHERE nin = ?',
          [dup.nin]
        );
        
        for (const membre of membres) {
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
    console.log(`Doublons de NIN: ${duplicates.length}`);
    
    if (membresWithoutNin === 0 && duplicates.length === 0) {
      console.log('\n✅ La base de données est prête pour la migration!');
      console.log('Vous pouvez exécuter la migration 012_make_nin_required.sql');
    } else {
      console.log('\n⚠️  La base de données nécessite des corrections avant la migration.');
      console.log('Exécutez: node src/scripts/fixNinIssuesSQL.js');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
checkNinStatus()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });
