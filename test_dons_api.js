const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:4000';
const TEST_IMAGE = '/tmp/test_recu.png';

// Fonction pour tester la création d'un don AVEC reçu
async function testCreateDonAvecRecu(token) {
  console.log('\n🧪 Test 1: Création d\'un don AVEC reçu');
  console.log('='.repeat(50));
  
  const form = new FormData();
  form.append('montant', '100');
  form.append('description', 'Don de test avec reçu');
  form.append('recu', fs.createReadStream(TEST_IMAGE));
  
  try {
    const response = await fetch(`${API_URL}/dons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Réponse:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Don créé avec succès');
      console.log(`   Statut: ${data.data.statut_don}`);
      console.log(`   Reçu URL: ${data.data.recu_url || 'N/A'}`);
      return data.data.id;
    } else {
      console.log('❌ Erreur:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
    return null;
  }
}

// Fonction pour tester la création d'un don SANS reçu
async function testCreateDonSansRecu(token) {
  console.log('\n🧪 Test 2: Création d\'un don SANS reçu');
  console.log('='.repeat(50));
  
  const form = new FormData();
  form.append('montant', '50');
  form.append('description', 'Don de test sans reçu');
  
  try {
    const response = await fetch(`${API_URL}/dons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Réponse:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Don créé avec succès');
      console.log(`   Statut: ${data.data.statut_don}`);
      console.log(`   Reçu URL: ${data.data.recu_url || 'N/A'}`);
      return data.data.id;
    } else {
      console.log('❌ Erreur:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
    return null;
  }
}

// Fonction pour récupérer les dons du membre
async function testGetMesDons(token) {
  console.log('\n🧪 Test 3: Récupération de mes dons');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${API_URL}/dons/mes-dons`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Nombre de dons:', data.data?.length || 0);
    
    if (data.success && data.data.length > 0) {
      console.log('✅ Dons récupérés avec succès');
      data.data.forEach((don, index) => {
        console.log(`\n   Don ${index + 1}:`);
        console.log(`   - ID: ${don.id}`);
        console.log(`   - Montant: ${don.montant}`);
        console.log(`   - Statut: ${don.statut_don}`);
        console.log(`   - Reçu: ${don.recu_url || 'Non fourni'}`);
      });
    } else {
      console.log('ℹ️  Aucun don trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('\n🚀 Tests de l\'API Dons');
  console.log('='.repeat(50));
  
  // Demander le token
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Entrez votre token d\'authentification: ', async (token) => {
    readline.close();
    
    if (!token || token.trim() === '') {
      console.log('❌ Token manquant. Test annulé.');
      return;
    }
    
    // Vérifier que l'image de test existe
    if (!fs.existsSync(TEST_IMAGE)) {
      console.log(`❌ Image de test introuvable: ${TEST_IMAGE}`);
      return;
    }
    
    // Exécuter les tests
    await testCreateDonAvecRecu(token);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testCreateDonSansRecu(token);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGetMesDons(token);
    
    console.log('\n✅ Tests terminés\n');
  });
}

// Exécuter les tests
runTests();
