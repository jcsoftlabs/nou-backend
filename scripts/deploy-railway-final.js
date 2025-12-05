#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuration de la connexion Railway
const DB_CONFIG = {
  host: 'mainline.proxy.rlwy.net',
  port: 18580,
  user: 'root',
  password: 'VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz',
  database: 'railway',
  connectTimeout: 60000,
  multipleStatements: true
};

// Fonction pour générer un code d'adhésion
const generateCodeAdhesion = (usedCodes, prenom, nom, telephone) => {
  const digits = telephone.replace(/\D/g, '');
  const firstLetterPrenom = prenom[0].toUpperCase();
  const secondLetterNom = nom.length > 1 ? nom[1].toUpperCase() : 'X';
  const last4Phone = digits.slice(-4);
  
  let code = `A${firstLetterPrenom}${secondLetterNom}${last4Phone}`;
  let suffix = 0;
  while (usedCodes.has(code)) {
    suffix += 1;
    code = `A${firstLetterPrenom}${secondLetterNom}${last4Phone}${suffix}`;
  }
  usedCodes.add(code);
  return code;
};

async function deploy() {
  let connection;
  
  try {
    console.log('🚀 Déploiement sur Railway...\n');
    
    // Connexion à la base de données
    console.log('📡 Connexion à Railway...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connecté\n');
    
    // Données de test
    const passwordHash = await bcrypt.hash('password123', 10);
    const usedCodes = new Set();
    
    const adminCode = generateCodeAdhesion(usedCodes, 'Système', 'Admin', '+50937000001');
    const jeanCode = generateCodeAdhesion(usedCodes, 'Jean', 'Dupont', '+50937111111');
    const marieCode = generateCodeAdhesion(usedCodes, 'Marie', 'Pierre', '+50937222222');
    
    console.log(`🔑 Codes générés: ${adminCode}, ${jeanCode}, ${marieCode}\n`);
    
    // Créer les tables manquantes
    console.log('🛠️  Création des tables manquantes...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS config_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_type VARCHAR(50) UNIQUE NOT NULL,
        points_value INT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fcm_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        membre_id INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        device_type VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        description TEXT,
        data_before JSON,
        data_after JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES membres(id) ON DELETE SET NULL
      )
    `);
    
    console.log('✅ Tables créées\n');
    
    // 1. Configuration des points
    console.log('📊 Insertion des configurations de points...');
    await connection.query(`
      INSERT IGNORE INTO config_points (action_type, points_value, description, active) VALUES
      ('referral_base', 10, 'Points de base pour parrainer un nouveau membre', true),
      ('referral_payment', 5, 'Points supplémentaires quand le filleul effectue son premier paiement', true),
      ('quiz_completion', 20, 'Points pour compléter un quiz', true),
      ('podcast_listen', 3, 'Points pour écouter un podcast', true)
    `);
    console.log('✅ Config points OK\n');
    
    // 2. Membres
    console.log('👥 Insertion des membres...');
    const [adminResult] = await connection.query(`
      INSERT INTO membres (
        username, code_adhesion, nom, prenom, sexe, date_de_naissance,
        telephone_principal, email, password_hash, role_utilisateur,
        departement, commune, Statuts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin', adminCode, 'Admin', 'Système', 'M', '1990-01-01',
      '+50937000001', 'admin@nou.ht', passwordHash, 'admin',
      'Ouest', 'Port-au-Prince', 'Dirigeant national'
    ]);
    const adminId = adminResult.insertId;
    
    const [jeanResult] = await connection.query(`
      INSERT INTO membres (
        username, code_adhesion, code_parrain, nom, prenom, surnom, sexe,
        lieu_de_naissance, date_de_naissance, telephone_principal, email,
        password_hash, role_utilisateur, departement, commune, Statuts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'jdupont', jeanCode, adminCode, 'Dupont', 'Jean', 'Ti Jean', 'M',
      'Port-au-Prince', '1995-03-15', '+50937111111', 'jean.dupont@example.ht',
      passwordHash, 'membre', 'Ouest', 'Pétion-Ville', 'Membre pré-adhérent'
    ]);
    const jeanId = jeanResult.insertId;
    
    const [marieResult] = await connection.query(`
      INSERT INTO membres (
        username, code_adhesion, code_parrain, nom, prenom, sexe,
        date_de_naissance, telephone_principal, email, password_hash,
        role_utilisateur, departement, commune, Statuts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'mpierre', marieCode, jeanCode, 'Pierre', 'Marie', 'F',
      '1992-07-20', '+50937222222', 'marie.pierre@example.ht', passwordHash,
      'membre', 'Nord', 'Cap-Haïtien', 'Membre pré-adhérent'
    ]);
    const marieId = marieResult.insertId;
    
    console.log(`✅ ${3} membres créés (IDs: ${adminId}, ${jeanId}, ${marieId})\n`);
    
    // 3. Referrals
    console.log('🔗 Insertion des referrals...');
    await connection.query(`
      INSERT INTO referrals (parrain_id, filleul_id, points_attribues, date_creation) VALUES
      (?, ?, 10, '2024-01-15'),
      (?, ?, 15, '2024-02-01')
    `, [adminId, jeanId, jeanId, marieId]);
    console.log('✅ Referrals OK\n');
    
    // 4. Cotisations
    console.log('💰 Insertion des cotisations...');
    await connection.query(`
      INSERT INTO cotisations (
        membre_id, montant, moyen_paiement, statut_paiement,
        date_paiement, date_verification, admin_verificateur_id,
        commentaire_verification
      ) VALUES (?, 500.00, 'moncash', 'valide', '2024-01-20', '2024-01-21', ?, 'Paiement vérifié')
    `, [jeanId, adminId]);
    console.log('✅ Cotisations OK\n');
    
    // 5. Formations
    console.log('🎓 Insertion des formations...');
    const [formationResult] = await connection.query(`
      INSERT INTO formations (titre, description, niveau, est_active, date_publication) VALUES
      ("Parcours Histoire & Institutions", "Formation sur l'histoire d'Haïti", 'intermediaire', true, '2024-01-05')
    `);
    const formationId = formationResult.insertId;
    
    // Modules
    const [moduleResult] = await connection.query(`
      INSERT INTO modules (formation_id, titre, description, type_contenu, contenu_texte, ordre) VALUES
      (?, "Module 1 - Histoire d'Haïti", "Introduction à l'histoire d'Haïti", 'texte', "Les grandes étapes de l'histoire d'Haïti", 1)
    `, [formationId]);
    const moduleId = moduleResult.insertId;
    console.log('✅ Formations OK\n');
    
    // 6. Quiz
    console.log('📝 Insertion des quiz...');
    const [quizResult] = await connection.query(`
      INSERT INTO quiz (module_id, titre, description, date_publication, date_expiration) VALUES
      (?, "Histoire d'Haïti - Niveau 1", "Testez vos connaissances", '2024-01-10', '2025-12-31')
    `, [moduleId]);
    const quizId = quizResult.insertId;
    
    // Questions
    await connection.query(`
      INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, bonne_reponse, points_question) VALUES
      (?, 'En quelle année Haïti a-t-elle proclamé son indépendance?', '1791', '1804', '1825', '1844', 'b', 5)
    `, [quizId]);
    console.log('✅ Quiz OK\n');
    
    // 7. Podcasts
    console.log('🎤️ Insertion des podcasts...');
    await connection.query(`
      INSERT INTO podcasts (titre, description, url_audio, est_en_direct, date_publication, duree_en_secondes) VALUES
      ('Bienvenue sur NOU - Épisode 1', 'Premier épisode de notre podcast', '/uploads/podcasts/episode1.mp3', false, '2024-01-01', 1800)
    `);
    console.log('✅ Podcasts OK\n');
    
    console.log('🎉 Déploiement terminé avec succès!\n');
    console.log('📋 Résumé:');
    console.log('   ✅ 4 configurations de points');
    console.log('   ✅ 3 membres');
    console.log('   ✅ 2 referrals');
    console.log('   ✅ 1 cotisation');
    console.log('   ✅ 1 formation avec 1 module');
    console.log('   ✅ 1 quiz avec questions');
    console.log('   ✅ 1 podcast\n');
    
    console.log('🔐 Identifiants de test:');
    console.log('   Admin: username=admin, password=password123');
    console.log('   Membre: username=jdupont, password=password123');
    console.log('   Membre: username=mpierre, password=password123');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.sqlMessage) {
      console.error('📄 SQL Error:', error.sqlMessage);
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter
deploy()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error.message);
    process.exit(1);
  });
