const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour corriger les hashes de mots de passe invalides dans la base de données
 * 
 * Ce script:
 * 1. Se connecte à la base de données Railway
 * 2. Identifie les membres avec des hashes invalides (trop courts)
 * 3. Régénère les hashes correctement pour ces membres
 * 4. Utilise 'password123' comme mot de passe par défaut
 */

async function fixPasswordHashes() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données Railway...\n');
    
    // URL de connexion Railway
    const databaseUrl = 'mysql://root:VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz@mainline.proxy.rlwy.net:18580/railway';
    
    connection = await mysql.createConnection(databaseUrl);
    console.log('✅ Connexion établie\n');
    
    // 1. Identifier les membres avec des hashes invalides
    console.log('🔍 Recherche des membres avec des hashes invalides...');
    const [membres] = await connection.execute(
      'SELECT id, username, nom, prenom, password_hash FROM membres'
    );
    
    console.log(`📊 ${membres.length} membres trouvés dans la base\n`);
    
    const membresInvalides = [];
    const membresValides = [];
    
    for (const membre of membres) {
      const hash = membre.password_hash;
      
      // Un hash bcrypt valide doit:
      // - Commencer par $2a$, $2b$ ou $2y$
      // - Faire exactement 60 caractères
      const isValid = hash && 
                      hash.length === 60 && 
                      (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'));
      
      if (!isValid) {
        membresInvalides.push(membre);
        console.log(`❌ Membre invalide: ${membre.username} (${membre.nom} ${membre.prenom})`);
        console.log(`   Hash actuel: "${hash}" (longueur: ${hash ? hash.length : 0})\n`);
      } else {
        membresValides.push(membre);
      }
    }
    
    console.log(`\n📈 Résumé:`);
    console.log(`   ✅ Membres valides: ${membresValides.length}`);
    console.log(`   ❌ Membres invalides: ${membresInvalides.length}\n`);
    
    if (membresInvalides.length === 0) {
      console.log('🎉 Aucun membre avec un hash invalide trouvé!\n');
      return;
    }
    
    // 2. Générer de nouveaux hashes pour les membres invalides
    console.log('🔧 Génération de nouveaux hashes...\n');
    
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(defaultPassword, salt);
    
    console.log(`🔑 Nouveau hash généré: ${newHash}`);
    console.log(`   Longueur: ${newHash.length} caractères\n`);
    
    // 3. Mettre à jour les membres invalides
    console.log('💾 Mise à jour des membres invalides...\n');
    
    for (const membre of membresInvalides) {
      await connection.execute(
        'UPDATE membres SET password_hash = ? WHERE id = ?',
        [newHash, membre.id]
      );
      console.log(`✅ Membre mis à jour: ${membre.username}`);
    }
    
    console.log(`\n✨ ${membresInvalides.length} membres corrigés avec succès!\n`);
    
    // 4. Vérification post-correction
    console.log('🔍 Vérification post-correction...');
    const [membresApres] = await connection.execute(
      'SELECT id, username, password_hash FROM membres WHERE id IN (?)',
      [membresInvalides.map(m => m.id)]
    );
    
    let tousValides = true;
    for (const membre of membresApres) {
      const hash = membre.password_hash;
      const isValid = hash && 
                      hash.length === 60 && 
                      (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'));
      
      if (isValid) {
        console.log(`   ✅ ${membre.username}: hash valide`);
      } else {
        console.log(`   ❌ ${membre.username}: hash toujours invalide!`);
        tousValides = false;
      }
    }
    
    if (tousValides) {
      console.log('\n🎉 Tous les hashes ont été corrigés avec succès!\n');
      console.log('📝 Mot de passe par défaut pour les membres corrigés: password123\n');
    } else {
      console.log('\n⚠️  Certains hashes n\'ont pas été corrigés correctement.\n');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des hashes:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée\n');
    }
  }
}

// Exécuter si lancé directement
if (require.main === module) {
  fixPasswordHashes()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = fixPasswordHashes;
