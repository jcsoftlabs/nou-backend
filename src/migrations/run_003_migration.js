const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour exécuter la migration 003: Ajout de la colonne username
 */
async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données...');
    
    // Créer la connexion
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nou_db'
    });
    
    console.log('✅ Connecté à la base de données');
    
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, '003_add_username_column.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Séparer les commandes SQL (par point-virgule)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Exécution de ${sqlCommands.length} commandes SQL...`);
    
    // Exécuter chaque commande
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      console.log(`\n[${i + 1}/${sqlCommands.length}] Exécution de la commande...`);
      
      try {
        await connection.query(command);
        console.log('✅ Commande exécutée avec succès');
      } catch (error) {
        // Si l'erreur est que la colonne existe déjà, ignorer
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  La colonne username existe déjà, migration déjà appliquée');
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration 003 exécutée avec succès !');
    console.log('\n📋 Résumé des modifications:');
    console.log('  - Colonne username ajoutée (VARCHAR(50), UNIQUE, NOT NULL)');
    console.log('  - Index créé sur username');
    console.log('  - Commentaire de table mis à jour');
    
    console.log('\n⚠️  IMPORTANT: Si des membres existent déjà dans la base,');
    console.log('   vous devrez leur attribuer des usernames uniques manuellement.');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('\n✅ La migration a déjà été appliquée');
    } else {
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

// Exécuter la migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✨ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = runMigration;
