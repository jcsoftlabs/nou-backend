const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour exécuter la migration 007: Correction des erreurs d'orthographe dans Statuts
 * 
 * ATTENTION: Cette migration va convertir les anciennes valeurs vers les nouvelles:
 * - 'Membre pre-adherent' → 'Membre pré-adhérent'
 * - 'Membre adherent' → 'Membre adhérent'
 * - 'Membre special' → 'Membre spécial'
 * - 'Chef d'equipe' → 'Chef d'équipe'
 * - 'Dirigeant departmental' → 'Dirigeant départemental'
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
    
    // Vérifier si Statuts_temp existe déjà
    console.log('\n📝 Vérification de l\'état de la base de données...');
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'membres' AND COLUMN_NAME IN ('Statuts', 'Statuts_temp')",
      [process.env.DB_NAME || 'nou_db']
    );
    
    const hasStatuts = columns.some(col => col.COLUMN_NAME === 'Statuts');
    const hasStatutsTemp = columns.some(col => col.COLUMN_NAME === 'Statuts_temp');
    
    console.log(`  - Colonne Statuts: ${hasStatuts ? '✅ existe' : '❌ n\'existe pas'}`);
    console.log(`  - Colonne Statuts_temp: ${hasStatutsTemp ? '✅ existe' : '❌ n\'existe pas'}`);
    
    // Étape 1: Créer Statuts_temp si elle n'existe pas
    if (!hasStatutsTemp) {
      console.log('\n📝 Étape 1: Création d\'une colonne temporaire...');
      await connection.query('ALTER TABLE membres ADD COLUMN Statuts_temp VARCHAR(50)');
      console.log('✅ Colonne temporaire créée');
      
      // Copier les valeurs existantes
      if (hasStatuts) {
        console.log('\n📝 Copie des valeurs existantes...');
        await connection.query('UPDATE membres SET Statuts_temp = Statuts');
        console.log('✅ Valeurs copiées');
      }
    } else {
      console.log('\n⚠️  La colonne Statuts_temp existe déjà, utilisation des données existantes');
    }
    
    // Étape 2: Supprimer l'ancienne colonne Statuts si elle existe
    if (hasStatuts) {
      console.log('\n📝 Étape 2: Suppression de l\'ancienne colonne Statuts...');
      await connection.query('ALTER TABLE membres DROP COLUMN Statuts');
      console.log('✅ Ancienne colonne supprimée');
    } else {
      console.log('\n⚠️  La colonne Statuts n\'existe déjà plus');
    }
    
    // Étape 3: Créer la nouvelle colonne avec les bonnes valeurs
    console.log('\n📝 Étape 3: Création de la nouvelle colonne avec les bonnes orthographes...');
    await connection.query(`
      ALTER TABLE membres
      ADD COLUMN Statuts ENUM(
        'Membre pré-adhérent',
        'Membre adhérent',
        'Membre spécial',
        'Chef d''équipe',
        'Dirigeant',
        'Leader',
        'Dirigeant national',
        'Dirigeant départemental',
        'Dirigeant communal',
        'Dirigeant section communale'
      ) DEFAULT 'Membre pré-adhérent'
    `);
    console.log('✅ Nouvelle colonne créée avec les bonnes orthographes');
    
    // Étape 4: Migrer les données avec conversion
    
    // Étape 4: Migrer les données avec conversion
    console.log('\n📝 Étape 4: Migration des données avec correction orthographique...');
    const conversions = [
      ['Membre pre-adherent', 'Membre pré-adhérent'],
      ['Membre adherent', 'Membre adhérent'],
      ['Membre special', 'Membre spécial'],
      ['Chef d\'equipe', 'Chef d\'équipe'],
      ['Dirigeant departmental', 'Dirigeant départemental']
    ];
    
    for (const [oldValue, newValue] of conversions) {
      const [result] = await connection.query(
        'UPDATE membres SET Statuts = ? WHERE Statuts_temp = ?',
        [newValue, oldValue]
      );
      if (result.affectedRows > 0) {
        console.log(`  ✅ ${result.affectedRows} membre(s): "${oldValue}" → "${newValue}"`);
      }
    }
    
    // Copier les valeurs qui n'ont pas changé
    await connection.query(`
      UPDATE membres 
      SET Statuts = Statuts_temp 
      WHERE Statuts IS NULL AND Statuts_temp IN (
        'Dirigeant',
        'Leader',
        'Dirigeant national',
        'Dirigeant communal',
        'Dirigeant section communale'
      )
    `);
    console.log('✅ Valeurs inchangées copiées');
    
    // Étape 5: Nettoyer la colonne temporaire
    console.log('\n📝 Étape 5: Nettoyage de la colonne temporaire...');
    await connection.query('ALTER TABLE membres DROP COLUMN Statuts_temp');
    console.log('✅ Colonne temporaire supprimée');
    
    console.log('\n✅ Migration 007 exécutée avec succès !');
    console.log('\n📋 Résumé des modifications:');
    console.log('  - Erreurs d\'orthographe corrigées dans la colonne Statuts');
    console.log('  - Toutes les données existantes ont été converties');
    
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
