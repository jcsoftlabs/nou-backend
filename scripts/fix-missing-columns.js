#!/usr/bin/env node

const mysql = require('mysql2/promise');

// Configuration de la connexion Railway
const DB_CONFIG = {
  host: 'mainline.proxy.rlwy.net',
  port: 18580,
  user: 'root',
  password: 'VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz',
  database: 'railway',
  connectTimeout: 60000
};

async function fixMissingColumns() {
  let connection;
  
  try {
    console.log('🔧 Ajout des colonnes manquantes...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connecté à Railway\n');
    
    // 1. Ajouter nombre_ecoutes à la table podcasts
    console.log('📄 Ajout de nombre_ecoutes à la table podcasts...');
    try {
      await connection.query(`
        ALTER TABLE podcasts 
        ADD COLUMN nombre_ecoutes INT DEFAULT 0 
        COMMENT 'Nombre de lectures/écoutes du podcast'
      `);
      console.log('✅ Colonne nombre_ecoutes ajoutée\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Colonne nombre_ecoutes existe déjà\n');
      } else {
        throw error;
      }
    }
    
    // 2. Ajouter total_points à la table formations
    console.log('📄 Ajout de total_points à la table formations...');
    try {
      await connection.query(`
        ALTER TABLE formations 
        ADD COLUMN total_points INT DEFAULT 0 
        COMMENT 'Total des points pour cette formation'
      `);
      console.log('✅ Colonne total_points ajoutée\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Colonne total_points existe déjà\n');
      } else {
        throw error;
      }
    }
    
    // 3. Calculer et mettre à jour total_points pour chaque formation
    console.log('📊 Calcul des total_points pour les formations...');
    const [formations] = await connection.query('SELECT id FROM formations');
    
    for (const formation of formations) {
      // Récupérer tous les quiz liés à cette formation via les modules
      const [result] = await connection.query(`
        SELECT SUM(qq.points_question) as total
        FROM quiz q
        JOIN modules m ON q.module_id = m.id
        JOIN quiz_questions qq ON qq.quiz_id = q.id
        WHERE m.formation_id = ?
      `, [formation.id]);
      
      const totalPoints = result[0].total || 0;
      
      await connection.query(
        'UPDATE formations SET total_points = ? WHERE id = ?',
        [totalPoints, formation.id]
      );
      
      console.log(`   Formation ${formation.id}: ${totalPoints} points`);
    }
    
    console.log('\n✅ total_points calculés et mis à jour\n');
    
    console.log('🎉 Toutes les colonnes ont été ajoutées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter
fixMissingColumns()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error.message);
    process.exit(1);
  });
