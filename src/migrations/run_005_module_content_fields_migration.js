const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour exécuter la migration 005: Champs de contenu riche sur les modules
 */
async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données...');
    
    // Créer la connexion
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'nou_db'
    });
    
    console.log('✅ Connecté à la base de données');
    
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, '005_add_module_content_fields.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Nettoyer le SQL : enlever les lignes de commentaires qui commencent par "--"
    const sqlWithoutComments = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Séparer les commandes SQL (par point-virgule)
    const sqlCommands = sqlWithoutComments
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`📝 Exécution de ${sqlCommands.length} commandes SQL...`);
    
    // Exécuter chaque commande
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      console.log(`\n[${i + 1}/${sqlCommands.length}] Exécution de la commande...`);
      
      try {
        await connection.query(command);
        console.log('✅ Commande exécutée avec succès');
      } catch (error) {
        // Tolérer certaines erreurs si la migration a déjà été appliquée
        if (error.code === 'ER_DUP_FIELDNAME' ||
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_CANT_CREATE_TABLE' ||
            error.code === 'ER_DUP_INDEX') {
          console.log(`⚠️  Commande ignorée (déjà appliquée ou objet existant): ${error.code}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration 005 exécutée avec succès !');
    console.log('\n📋 Résumé des modifications:');
    console.log('  - Colonnes type_contenu, contenu_texte, image_url, video_url ajoutées à la table modules');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

// Exécuter la migration si lancé directement
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
