const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// URL de connexion Railway
const RAILWAY_DATABASE_URL = process.env.RAILWAY_DATABASE_URL || 'mysql://root:VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz@mainline.proxy.rlwy.net:18580/railway';

// Parser l'URL MySQL
function parseMySQLUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Format d\'URL MySQL invalide');
  }
  return {
    host: match[3],
    port: parseInt(match[4]),
    user: match[1],
    password: match[2],
    database: match[5]
  };
}

async function runMigrations(connection) {
  console.log('\n🔄 Exécution des migrations SQL...\n');
  
  const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');
  const migrationFiles = [
    '001_create_membres_table.sql',
    '002_create_additional_tables.sql',
    '003_add_username_column.sql',
    '004_create_formations_and_modules.sql',
    '005_add_module_content_fields.sql',
    '006_add_statuts_to_membres.sql',
    '007_fix_statuts_typos.sql',
    '008_create_dons_table.sql'
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier ${file} non trouvé, passage au suivant...`);
      continue;
    }

    console.log(`📄 Exécution de ${file}...`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Diviser le fichier SQL en instructions individuelles
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (error) {
          // Ignorer les erreurs de duplicata (tables, colonnes, clés, contraintes FK)
          if (
            error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.code === 'ER_DUP_FIELDNAME' ||
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_FK_DUP_NAME' ||
            error.message.includes('Duplicate column') ||
            error.message.includes('Duplicate key') ||
            error.message.includes('Duplicate foreign key')
          ) {
            console.log(`   ℹ️  ${error.message} (ignoré)`);
          } else {
            throw error;
          }
        }
      }
      
      console.log(`   ✅ ${file} exécuté avec succès`);
    } catch (error) {
      console.error(`   ❌ Erreur lors de l'exécution de ${file}:`, error.message);
      throw error;
    }
  }
  
  console.log('\n✅ Toutes les migrations ont été exécutées\n');
}

async function runSeeding() {
  console.log('🌱 Exécution du seeding...\n');
  
  // Définir les variables d'environnement pour Sequelize
  const dbConfig = parseMySQLUrl(RAILWAY_DATABASE_URL);
  process.env.DB_HOST = dbConfig.host;
  process.env.DB_USER = dbConfig.user;
  process.env.DB_PASS = dbConfig.password;
  process.env.DB_NAME = dbConfig.database;
  process.env.DB_PORT = dbConfig.port.toString();

  // Charger et exécuter le script de seeding
  const seedDb = require('../src/scripts/seedDb');
  await seedDb();
  
  console.log('\n✅ Seeding terminé avec succès\n');
}

async function deploy() {
  let connection;
  
  try {
    console.log('🚀 Démarrage du déploiement sur Railway...\n');
    
    // Parser l'URL de connexion
    const dbConfig = parseMySQLUrl(RAILWAY_DATABASE_URL);
    console.log(`📡 Connexion à: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // Se connecter à la base de données
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true
    });
    
    console.log('✅ Connexion à Railway établie\n');
    
    // Exécuter les migrations
    await runMigrations(connection);
    
    // Fermer la connexion avant le seeding (Sequelize va créer sa propre connexion)
    await connection.end();
    connection = null;
    
    // Exécuter le seeding
    await runSeeding();
    
    console.log('🎉 Déploiement terminé avec succès!\n');
    console.log('📋 Résumé:');
    console.log('   ✅ Base de données migrée');
    console.log('   ✅ Données de test insérées');
    console.log('\n🔐 Identifiants de test:');
    console.log('   Admin: username=admin, password=password123');
    console.log('   Membre: username=jdupont, password=password123');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du déploiement:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

// Exécuter le déploiement
if (require.main === module) {
  deploy().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = deploy;
