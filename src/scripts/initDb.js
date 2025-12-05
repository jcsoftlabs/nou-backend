const mysql = require('mysql2/promise');
const { sequelize } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connexion à MySQL...');
    
    // Connexion sans spécifier la base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    });
    
    console.log('✅ Connecté à MySQL');
    
    // Créer la base de données si elle n'existe pas
    const dbName = process.env.DB_NAME;
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de données "${dbName}" créée ou déjà existante`);
    
    await connection.end();
    
    // Tester la connexion Sequelize
    console.log('🔄 Test de la connexion Sequelize...');
    await sequelize.authenticate();
    console.log('✅ Connexion Sequelize établie avec succès');
    
    // Synchroniser tous les modèles
    console.log('🔄 Synchronisation des modèles avec la base de données...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tous les modèles ont été synchronisés avec succès');
    
    console.log('\n🎉 Initialisation de la base de données terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
    await sequelize.close();
  }
}

// Exécuter si lancé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
