#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: 'mainline.proxy.rlwy.net',
  port: 18580,
  user: 'root',
  password: 'VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz',
  database: 'railway',
  connectTimeout: 60000,
  multipleStatements: true
};

async function applyMigrations() {
  let connection;

  try {
    console.log('🔄 Application des migrations news/annonces sur Railway...');

    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connecté à Railway');

    const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');
    const files = [
      '009_create_news_table.sql',
      '010_create_annonces_table.sql'
    ];

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`\n📄 Exécution de ${file}...`);

      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);

      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (error) {
          if (
            error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.code === 'ER_DUP_FIELDNAME' ||
            error.code === 'ER_DUP_KEYNAME' ||
            error.message.includes('already exists')
          ) {
            console.log(`   ℹ️  ${error.message} (ignoré)`);
          } else {
            throw error;
          }
        }
      }

      console.log(`   ✅ Migration ${file} appliquée`);
    }

    console.log('\n🎉 Migrations news/annonces appliquées avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'application des migrations:', error.message || error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigrations();
