#!/usr/bin/env node

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'mainline.proxy.rlwy.net',
  port: 18580,
  user: 'root',
  password: 'VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz',
  database: 'railway',
  connectTimeout: 60000
};

async function addMissingData() {
  let connection;
  
  try {
    console.log('🔄 Ajout des données manquantes...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connecté à Railway\n');
    
    // Vérifier combien de podcasts existent
    const [podcasts] = await connection.query('SELECT COUNT(*) as count FROM podcasts');
    console.log(`📊 Podcasts existants: ${podcasts[0].count}`);
    
    if (podcasts[0].count === 0) {
      console.log('🎙️ Ajout des podcasts...');
      await connection.query(`
        INSERT INTO podcasts (titre, description, url_audio, est_en_direct, date_publication, duree_en_secondes, img_couverture_url, nombre_ecoutes) VALUES
        ('Bienvenue sur NOU - Épisode 1', 'Premier épisode de notre podcast. Découvrez notre vision et nos objectifs.', '/uploads/podcasts/episode1.mp3', false, '2024-01-01', 1800, '/uploads/podcasts/covers/episode1.jpg', 150),
        ('Les défis de notre génération', 'Discussion sur les défis auxquels font face les jeunes haïtiens.', '/uploads/podcasts/episode2.mp3', false, '2024-01-15', 2400, '/uploads/podcasts/covers/episode2.jpg', 98),
        ('Live - Session Q&A', 'Session de questions-réponses en direct avec nos membres.', null, true, NOW(), null, '/uploads/podcasts/covers/live.jpg', 45),
        ("L'importance de l'engagement civique", "Pourquoi chaque citoyen doit s'impliquer dans la vie politique et sociale.", '/uploads/podcasts/episode3.mp3', false, '2024-02-01', 2100, '/uploads/podcasts/covers/episode3.jpg', 72)
      `);
      console.log('✅ 4 podcasts ajoutés\n');
    } else {
      console.log('ℹ️  Podcasts déjà présents\n');
    }
    
    // Vérifier les formations
    const [formations] = await connection.query('SELECT COUNT(*) as count FROM formations');
    console.log(`📊 Formations existantes: ${formations[0].count}`);
    
    if (formations[0].count < 2) {
      console.log('🎓 Ajout d\'une formation supplémentaire...');
      await connection.query(`
        INSERT INTO formations (titre, description, niveau, image_couverture_url, est_active, date_publication, total_points) VALUES
        ('Parcours Culture haïtienne', 'Découverte de la culture et des traditions haïtiennes.', 'debutant', '/uploads/formations/culture.jpg', true, '2024-03-01', 0)
      `);
      console.log('✅ Formation ajoutée\n');
    } else {
      console.log('ℹ️  Formations complètes\n');
    }
    
    // Compter les données finales
    console.log('📈 Résumé final:');
    const [finalPodcasts] = await connection.query('SELECT COUNT(*) as count FROM podcasts');
    const [finalFormations] = await connection.query('SELECT COUNT(*) as count FROM formations');
    const [finalQuiz] = await connection.query('SELECT COUNT(*) as count FROM quiz');
    const [finalMembres] = await connection.query('SELECT COUNT(*) as count FROM membres');
    const [finalModules] = await connection.query('SELECT COUNT(*) as count FROM modules');
    
    console.log(`   - Podcasts: ${finalPodcasts[0].count}`);
    console.log(`   - Formations: ${finalFormations[0].count}`);
    console.log(`   - Modules: ${finalModules[0].count}`);
    console.log(`   - Quiz: ${finalQuiz[0].count}`);
    console.log(`   - Membres: ${finalMembres[0].count}`);
    
    console.log('\n🎉 Données ajoutées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMissingData()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error.message);
    process.exit(1);
  });
