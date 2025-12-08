const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

/**
 * Script pour exécuter la migration 012 (rendre le NIN obligatoire et unique)
 */

async function runMigration012() {
  let connection;
  
  try {
    console.log('🔄 Exécution de la migration 012: Rendre le NIN obligatoire et unique\n');
    
    // Créer la connexion MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connecté à la base de données\n');
    
    // Lire le fichier SQL de migration
    const migrationPath = path.join(__dirname, '../migrations/012_make_nin_required.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('📄 Contenu de la migration:');
    console.log('-----------------------------------');
    console.log(migrationSQL);
    console.log('-----------------------------------\n');
    
    // Nettoyer le SQL (enlever les commentaires et lignes vides)
    const cleanedSQL = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');
    
    // Exécuter chaque commande SQL séparément
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log('🚀 Exécution de la migration...\n');
    console.log(`Nombre de commandes SQL à exécuter: ${statements.length}\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n[${i + 1}/${statements.length}] Exécution:`);
        console.log(statement);
        console.log('-----------------------------------');
        try {
          await connection.execute(statement);
          console.log('✅ Succès');
        } catch (error) {
          // Si l'index ou contrainte existe déjà, c'est OK
          if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_KEY') {
            console.log('ℹ️  Index/contrainte déjà existant, ignoré');
          } else {
            console.error('❌ Erreur:', error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('=' .repeat(50));
    console.log('✅ Migration 012 exécutée avec succès!');
    console.log('=' .repeat(50));
    console.log('\nLe champ NIN est maintenant:');
    console.log('  - Obligatoire (NOT NULL)');
    console.log('  - Unique');
    console.log('  - Indexé pour de meilleures performances\n');
    
    // Vérifier la structure de la table
    console.log('📊 Vérification de la structure de la colonne NIN...\n');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM membres WHERE Field = 'nin'"
    );
    
    if (columns.length > 0) {
      console.log('Détails de la colonne NIN:');
      console.log(columns[0]);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
runMigration012()
  .then(() => {
    console.log('\n✅ Migration terminée avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });
