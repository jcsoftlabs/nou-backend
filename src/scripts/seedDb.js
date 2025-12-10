const bcrypt = require('bcryptjs');
const {
  sequelize,
  Membre,
  Cotisation,
  Referral,
  Podcast,
  Quiz,
  QuizQuestion,
  QuizResultat,
  ConfigPoints,
  FCMToken,
  AuditLog,
  Formation,
  ModuleFormation
} = require('../models');

/**
 * Génère un code d'adhésion (code de parrainage) suivant la nouvelle structure :
 * A + 1ère lettre du prénom + 2ème lettre du nom de famille + 4 derniers chiffres du téléphone
 * Exemple : A + J (Jean) + U (Dupont) + 1234 => AJU1234
 */
const generateCodeAdhesion = (usedCodes = new Set(), data) => {
  const prenom = (data.prenom || '').trim();
  const nom = (data.nom || '').trim();
  const telephone = (data.telephone_principal || '').toString();

  const digits = telephone.replace(/\D/g, '');

  if (!prenom || !nom || digits.length < 4) {
    throw new Error("Impossible de générer le code d'adhésion pour le seeding : prénom, nom ou téléphone invalide");
  }

  const firstLetterPrenom = prenom[0].toUpperCase();
  const secondLetterNom = nom.length > 1 ? nom[1].toUpperCase() : 'X';
  const last4Phone = digits.slice(-4);

  const baseCode = `A${firstLetterPrenom}${secondLetterNom}${last4Phone}`;

  let code = baseCode;
  let suffix = 0;
  while (usedCodes.has(code)) {
    suffix += 1;
    code = `${baseCode}${suffix}`;
  }

  usedCodes.add(code);
  return code;
};

async function seedDatabase() {
  try {
console.log('🔄 Démarrage du seeding de la base de données...\\n');

    // Nettoyage des données existantes (dans l'ordre inverse des dépendances)
    console.log('🗑️  Nettoyage des données existantes...');
    await AuditLog.destroy({ where: {} });
    await FCMToken.destroy({ where: {} });
    await QuizResultat.destroy({ where: {} });
    await QuizQuestion.destroy({ where: {} });
    await Quiz.destroy({ where: {} });
    await ModuleFormation.destroy({ where: {} });
    await Formation.destroy({ where: {} });
    await Podcast.destroy({ where: {} });
    await Cotisation.destroy({ where: {} });
    await Referral.destroy({ where: {} });
    await Membre.destroy({ where: {} });
    await ConfigPoints.destroy({ where: {} });
console.log('✅ Nettoyage terminé\\n');

    // 1. Configuration des points
    console.log('📊 Insertion de la configuration des points...');
    const configPoints = await ConfigPoints.bulkCreate([
      {
        action_type: 'referral_base',
        points_value: 10,
        description: 'Points de base pour parrainer un nouveau membre',
        active: true
      },
      {
        action_type: 'referral_payment',
        points_value: 5,
        description: 'Points supplémentaires quand le filleul effectue son premier paiement',
        active: true
      },
      {
        action_type: 'quiz_completion',
        points_value: 20,
        description: 'Points pour compléter un quiz',
        active: true
      },
      {
        action_type: 'podcast_listen',
        points_value: 3,
        description: 'Points pour écouter un podcast',
        active: true
      }
    ]);
console.log(`✅ ${configPoints.length} configurations de points créées\\n`);

    // 2. Création des membres
    console.log('👥 Insertion des membres...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    // Générer les codes d'adhésion selon la nouvelle structure
    const usedCodes = new Set();

    const adminData = {
      nom: 'Admin',
      prenom: 'Système',
      telephone_principal: '+50937000001'
    };

    const jeanData = {
      nom: 'Dupont',
      prenom: 'Jean',
      telephone_principal: '+50937111111'
    };

    const marieData = {
      nom: 'Pierre',
      prenom: 'Marie',
      telephone_principal: '+50937222222'
    };

    const paulData = {
      nom: 'Joseph',
      prenom: 'Paul',
      telephone_principal: '+50937333333'
    };

    const sophieData = {
      nom: 'Charles',
      prenom: 'Sophie',
      telephone_principal: '+50937444444'
    };

    const adminCode = generateCodeAdhesion(usedCodes, adminData);
    const jeanCode = generateCodeAdhesion(usedCodes, jeanData);
    const marieCode = generateCodeAdhesion(usedCodes, marieData);
    const paulCode = generateCodeAdhesion(usedCodes, paulData);
    const sophieCode = generateCodeAdhesion(usedCodes, sophieData);
    
    console.log('🔑 Nouveaux codes générés (exemples):');
    console.log(`   - Admin: ${adminCode}`);
console.log(`   - Jean: ${jeanCode}\\n`);

    const membres = await Membre.bulkCreate([
      // Admin
      {
        username: 'admin',
        code_adhesion: adminCode,
        nom: 'Admin',
        prenom: 'Système',
        sexe: 'M',
        date_de_naissance: '1990-01-01',
        telephone_principal: '+50937000001',
        email: 'admin@nou.ht',
        password_hash: passwordHash,
        role_utilisateur: 'admin',
        departement: 'Ouest',
        commune: 'Port-au-Prince'
      },
      // Membres normaux
      {
        username: 'jdupont',
        code_adhesion: jeanCode,
        code_parrain: adminCode,
        nom: 'Dupont',
        prenom: 'Jean',
        surnom: 'Ti Jean',
        sexe: 'M',
        lieu_de_naissance: 'Port-au-Prince',
        date_de_naissance: '1995-03-15',
        nom_pere: 'Pierre Dupont',
        nom_mere: 'Marie Dupont',
        situation_matrimoniale: 'Célibataire',
        nb_enfants: 0,
        nb_personnes_a_charge: 2,
        nin: 'NIN001234567',
        nif: 'NIF001234567',
        telephone_principal: '+50937111111',
        telephone_etranger: '+13051234567',
        email: 'jean.dupont@example.ht',
        adresse_complete: '123 Rue de la Liberté, Pétion-Ville',
        profession: 'Ingénieur',
        occupation: 'Développeur',
        departement: 'Ouest',
        commune: 'Pétion-Ville',
        section_communale: 'Pétion-Ville Centre',
        facebook: 'facebook.com/jdupont',
        instagram: '@jdupont',
        a_ete_membre_politique: false,
        a_ete_membre_organisation: true,
        role_organisation_precedent: 'Secrétaire',
        nom_organisation_precedente: 'Association des Jeunes',
        referent_nom: 'Charles',
        referent_prenom: 'Robert',
        referent_telephone: '+50937999999',
        relation_avec_referent: 'Ami',
        a_ete_condamne: false,
        a_violé_loi_drogue: false,
        a_participe_activite_terroriste: false,
        password_hash: passwordHash,
        role_utilisateur: 'membre'
      },
      {
        username: 'mpierre',
        code_adhesion: marieCode,
        code_parrain: jeanCode,
        nom: 'Pierre',
        prenom: 'Marie',
        surnom: 'Manman Mari',
        sexe: 'F',
        lieu_de_naissance: 'Cap-Haïtien',
        date_de_naissance: '1992-07-20',
        nom_pere: 'Jacques Pierre',
        nom_mere: 'Claudette Pierre',
        situation_matrimoniale: 'Mariée',
        nb_enfants: 2,
        nb_personnes_a_charge: 4,
        nin: 'NIN002345678',
        telephone_principal: '+50937222222',
        email: 'marie.pierre@example.ht',
        adresse_complete: '45 Avenue Jean-Jacques Dessalines',
        profession: 'Enseignante',
        occupation: 'Professeur de français',
        departement: 'Nord',
        commune: 'Cap-Haïtien',
        section_communale: 'Centre-ville',
        a_ete_membre_politique: false,
        a_ete_membre_organisation: false,
        referent_nom: 'Dupont',
        referent_prenom: 'Jean',
        referent_telephone: '+50937111111',
        relation_avec_referent: 'Collègue',
        a_ete_condamne: false,
        a_violé_loi_drogue: false,
        a_participe_activite_terroriste: false,
        password_hash: passwordHash,
        role_utilisateur: 'membre'
      },
      {
        username: 'pjoseph',
        code_adhesion: paulCode,
        code_parrain: jeanCode,
        nom: 'Joseph',
        prenom: 'Paul',
        sexe: 'M',
        lieu_de_naissance: 'Jacmel',
        date_de_naissance: '1988-11-10',
        situation_matrimoniale: 'Célibataire',
        nb_enfants: 1,
        nb_personnes_a_charge: 1,
        telephone_principal: '+50937333333',
        email: 'paul.joseph@example.ht',
        adresse_complete: 'Route de Kenscoff',
        profession: 'Commerçant',
        departement: 'Sud-Est',
        commune: 'Jacmel',
        a_ete_membre_politique: false,
        a_ete_membre_organisation: false,
        a_ete_condamne: false,
        a_violé_loi_drogue: false,
        a_participe_activite_terroriste: false,
        password_hash: passwordHash,
        role_utilisateur: 'membre'
      },
      {
        username: 'scharles',
        code_adhesion: sophieCode,
        nom: 'Charles',
        prenom: 'Sophie',
        sexe: 'F',
        lieu_de_naissance: 'Les Cayes',
        date_de_naissance: '1997-05-25',
        situation_matrimoniale: 'Célibataire',
        nb_enfants: 0,
        telephone_principal: '+50937444444',
        email: 'sophie.charles@example.ht',
        profession: 'Étudiante',
        departement: 'Sud',
        commune: 'Les Cayes',
        a_ete_membre_politique: false,
        a_ete_membre_organisation: false,
        a_ete_condamne: false,
        a_violé_loi_drogue: false,
        a_participe_activite_terroriste: false,
        password_hash: passwordHash,
        role_utilisateur: 'membre'
      }
    ]);
console.log(`✅ ${membres.length} membres créés\\n`);

    // Récupération des IDs des membres insérés
    const adminId = membres.find(m => m.username === 'admin').id;
    const jeanId = membres.find(m => m.username === 'jdupont').id;
    const marieId = membres.find(m => m.username === 'mpierre').id;
    const paulId = membres.find(m => m.username === 'pjoseph').id;
    const sophieId = membres.find(m => m.username === 'scharles').id;

    // 3. Création des referrals
    console.log('🔗 Insertion des referrals...');
    const referrals = await Referral.bulkCreate([
      {
        parrain_id: adminId, // Admin parraine Jean
        filleul_id: jeanId,
        points_attribues: 10,
        date_creation: new Date('2024-01-15')
      },
      {
        parrain_id: jeanId, // Jean parraine Marie
        filleul_id: marieId,
        points_attribues: 15, // Base + premier paiement
        date_creation: new Date('2024-02-01')
      },
      {
        parrain_id: jeanId, // Jean parraine Paul
        filleul_id: paulId,
        points_attribues: 15,
        date_creation: new Date('2024-02-15')
      }
    ]);
console.log(`✅ ${referrals.length} referrals créés\\n`);

    // 4. Création des cotisations
    console.log('💰 Insertion des cotisations...');
    const cotisations = await Cotisation.bulkCreate([
      {
        membre_id: jeanId,
        montant: 500.00,
        moyen_paiement: 'moncash',
        statut_paiement: 'valide',
        date_paiement: new Date('2024-01-20'),
        date_verification: new Date('2024-01-21'),
        admin_verificateur_id: adminId,
        commentaire_verification: 'Paiement vérifié et validé'
      },
      {
        membre_id: marieId,
        montant: 500.00,
        moyen_paiement: 'cash',
        statut_paiement: 'valide',
        date_paiement: new Date('2024-02-10'),
        date_verification: new Date('2024-02-10'),
        admin_verificateur_id: adminId,
        commentaire_verification: 'Reçu en espèces'
      },
      {
        membre_id: paulId,
        montant: 500.00,
        moyen_paiement: 'recu_upload',
        statut_paiement: 'en_attente',
        date_paiement: new Date('2024-03-01'),
        url_recu: '/uploads/recus/recu_004.jpg'
      },
      {
        membre_id: sophieId,
        montant: 250.00,
        moyen_paiement: 'moncash',
        statut_paiement: 'en_attente',
        date_paiement: new Date('2024-03-15')
      },
      {
        membre_id: jeanId,
        montant: 500.00,
        moyen_paiement: 'moncash',
        statut_paiement: 'valide',
        date_paiement: new Date('2024-04-01'),
        date_verification: new Date('2024-04-02'),
        admin_verificateur_id: adminId,
        commentaire_verification: 'Cotisation mensuelle validée'
      }
    ]);
console.log(`✅ ${cotisations.length} cotisations créées\\n`);

    // 5. Création des podcasts
    console.log('🎙️ Insertion des podcasts...');
    const podcasts = await Podcast.bulkCreate([
      {
        titre: 'Bienvenue sur NOU - Épisode 1',
        description: 'Premier épisode de notre podcast. Découvrez notre vision et nos objectifs pour le mouvement.',
        url_audio: '/uploads/podcasts/episode1.mp3',
        est_en_direct: false,
        date_publication: new Date('2024-01-01'),
        duree_en_secondes: 1800,
        img_couverture_url: '/uploads/podcasts/covers/episode1.jpg',
        nombre_ecoutes: 150
      },
      {
        titre: 'Les défis de notre génération',
        description: "Discussion sur les défis auxquels font face les jeunes haïtiens aujourd'hui.",
        url_audio: '/uploads/podcasts/episode2.mp3',
        est_en_direct: false,
        date_publication: new Date('2024-01-15'),
        duree_en_secondes: 2400,
        img_couverture_url: '/uploads/podcasts/covers/episode2.jpg',
        nombre_ecoutes: 98
      },
      {
        titre: 'Live - Session Q&A',
        description: 'Session de questions-réponses en direct avec nos membres.',
        url_live: 'https://youtube.com/live/xyz123',
        est_en_direct: true,
        date_publication: new Date(),
        img_couverture_url: '/uploads/podcasts/covers/live.jpg',
        nombre_ecoutes: 45
      },
      {
        titre: "L'importance de l'engagement civique",
        description: "Pourquoi chaque citoyen doit s'impliquer dans la vie politique et sociale.",
        url_audio: '/uploads/podcasts/episode3.mp3',
        est_en_direct: false,
        date_publication: new Date('2024-02-01'),
        duree_en_secondes: 2100,
        img_couverture_url: '/uploads/podcasts/covers/episode3.jpg',
        nombre_ecoutes: 72
      }
    ]);
console.log(`✅ ${podcasts.length} podcasts créés\\n`);

    // 6. Création des quiz
    console.log('📝 Insertion des quiz...');
    const quizzes = await Quiz.bulkCreate([
      {
        titre: "Histoire d'Haïti - Niveau 1",
        description: "Testez vos connaissances sur l'histoire d'Haïti",
        date_publication: new Date('2024-01-10'),
        date_expiration: new Date('2024-12-31')
      },
      {
        titre: 'Constitution haïtienne',
        description: 'Quiz sur la constitution de 1987',
        date_publication: new Date('2024-02-01'),
        date_expiration: new Date('2024-12-31')
      },
      {
        titre: 'Culture et traditions',
        description: 'Connaissez-vous bien la culture haïtienne?',
        date_publication: new Date('2024-03-01'),
        date_expiration: new Date('2024-12-31')
      }
    ]);
console.log(`✅ ${quizzes.length} quiz créés\\n`);

    // Récupération des IDs des quiz insérés
    const quiz1Id = quizzes[0].id;
    const quiz2Id = quizzes[1].id;
    const quiz3Id = quizzes[2].id;

    // 7. Création des formations et modules
    console.log('🎓 Insertion des formations et modules...');
    const formations = await Formation.bulkCreate([
      {
        titre: "Parcours Histoire & Institutions",
        description: "Formation sur l'histoire d'Haïti et sa constitution.",
        niveau: 'intermediaire',
        image_couverture_url: '/uploads/formations/histoire_constitution.jpg',
        est_active: true,
        date_publication: new Date('2024-01-05')
      },
      {
        titre: 'Parcours Culture haïtienne',
        description: 'Découverte de la culture et des traditions haïtiennes.',
        niveau: 'debutant',
        image_couverture_url: '/uploads/formations/culture.jpg',
        est_active: true,
        date_publication: new Date('2024-03-01')
      }
    ]);
    console.log(`✅ ${formations.length} formations créées`);

    const formation1Id = formations[0].id;
    const formation2Id = formations[1].id;

    const modules = await ModuleFormation.bulkCreate([
      {
        formation_id: formation1Id,
        titre: "Module 1 - Histoire d'Haïti",
        description: "Introduction à l'histoire d'Haïti et aux grandes périodes historiques.",
        type_contenu: 'texte',
        contenu_texte: "Dans ce module, nous présentons les grandes étapes de l'histoire d'Haïti, de la période précolombienne à l'indépendance.",
        image_url: '/uploads/formations/histoire_module1.jpg',
        ordre: 1
      },
      {
        formation_id: formation1Id,
        titre: 'Module 2 - Constitution',
        description: 'Étude de la constitution de 1987 et de ses principes clés.',
        type_contenu: 'texte',
        contenu_texte: "Ce module détaille la structure de la constitution haïtienne de 1987, ses principes fondamentaux et les droits qu'elle garantit.",
        image_url: '/uploads/formations/constitution_module2.jpg',
        ordre: 2
      },
      {
        formation_id: formation2Id,
        titre: 'Module 1 - Culture et traditions',
        description: 'Langue, cuisine et traditions populaires.',
        type_contenu: 'mixte',
        contenu_texte: 'Découverte de la richesse culturelle haïtienne à travers la langue créole, la cuisine, la musique et les fêtes traditionnelles.',
        image_url: '/uploads/formations/culture_module1.jpg',
        video_url: 'https://youtube.com/watch?v=xxxxxxx',
        ordre: 1
      }
    ]);
console.log(`✅ ${modules.length} modules de formation créés\\n`);

    const moduleHistoireId = modules.find(m => m.titre.includes('Histoire')).id;
    const moduleConstitutionId = modules.find(m => m.titre.includes('Constitution')).id;
    const moduleCultureId = modules.find(m => m.titre.includes('Culture')).id;

    // Associer les quiz existants aux modules
    await quizzes.find(q => q.id === quiz1Id).update({ module_id: moduleHistoireId }); // Histoire d'Haïti
    await quizzes.find(q => q.id === quiz2Id).update({ module_id: moduleConstitutionId }); // Constitution
    await quizzes.find(q => q.id === quiz3Id).update({ module_id: moduleCultureId }); // Culture

    // 8. Création des questions de quiz
    console.log('❓ Insertion des questions de quiz...');
    const questions = await QuizQuestion.bulkCreate([
      // Quiz 1 - Histoire d'Haïti
      {
        quiz_id: quiz1Id,
        question: 'En quelle année Haïti a-t-elle proclamé son indépendance?',
        option_a: '1791',
        option_b: '1804',
        option_c: '1825',
        option_d: '1844',
        bonne_reponse: 'b',
        points_question: 5
      },
      {
        quiz_id: quiz1Id,
        question: "Qui était le premier empereur d'Haïti?",
        option_a: 'Toussaint Louverture',
        option_b: 'Jean-Jacques Dessalines',
        option_c: 'Henri Christophe',
        option_d: 'Alexandre Pétion',
        bonne_reponse: 'b',
        points_question: 5
      },
      {
        quiz_id: quiz1Id,
        question: 'Quelle bataille a marqué la victoire finale contre les forces françaises?',
        option_a: 'Bataille de Vertières',
        option_b: 'Bataille de Crête-à-Pierrot',
        option_c: 'Bataille de Ravine-à-Couleuvres',
        option_d: 'Bataille de la Butte Charrier',
        bonne_reponse: 'a',
        points_question: 5
      },
      // Quiz 2 - Constitution
      {
        quiz_id: quiz2Id,
        question: "En quelle année la constitution actuelle d'Haïti a-t-elle été adoptée?",
        option_a: '1964',
        option_b: '1983',
        option_c: '1987',
        option_d: '1990',
        bonne_reponse: 'c',
        points_question: 5
      },
      {
        quiz_id: quiz2Id,
        question: 'Combien de départements compte Haïti selon la constitution?',
        option_a: '8',
        option_b: '9',
        option_c: '10',
        option_d: '11',
        bonne_reponse: 'c',
        points_question: 5
      },
      // Quiz 3 - Culture
      {
        quiz_id: quiz3Id,
        question: "Quelle est la langue officielle d'Haïti avec le français?",
        option_a: 'Anglais',
        option_b: 'Espagnol',
        option_c: 'Créole haïtien',
        option_d: 'Portugais',
        bonne_reponse: 'c',
        points_question: 5
      },
      {
        quiz_id: quiz3Id,
        question: "Quel est le plat national d'Haïti?",
        option_a: 'Griot',
        option_b: 'Riz djon-djon',
        option_c: 'Lambi',
        option_d: 'Soupe joumou',
        bonne_reponse: 'a',
        points_question: 5
      }
    ]);
console.log(`✅ ${questions.length} questions créées\\n`);

    // 8. Création des résultats de quiz
    console.log('📊 Insertion des résultats de quiz...');
    const resultats = await QuizResultat.bulkCreate([
      {
        membre_id: jeanId,
        quiz_id: quiz1Id,
        score_total: 15,
        date_participation: new Date('2024-01-25')
      },
      {
        membre_id: marieId,
        quiz_id: quiz1Id,
        score_total: 10,
        date_participation: new Date('2024-02-05')
      },
      {
        membre_id: jeanId,
        quiz_id: quiz2Id,
        score_total: 10,
        date_participation: new Date('2024-02-10')
      },
      {
        membre_id: paulId,
        quiz_id: quiz1Id,
        score_total: 5,
        date_participation: new Date('2024-03-01')
      }
    ]);
console.log(`✅ ${resultats.length} résultats créés\\n`);

    // 9. Création des tokens FCM (pour les notifications)
    console.log('📱 Insertion des tokens FCM...');
    const fcmTokens = await FCMToken.bulkCreate([
      {
        membre_id: jeanId,
        token: 'fcm_token_jean_android_123456',
        device_type: 'android'
      },
      {
        membre_id: marieId,
        token: 'fcm_token_marie_ios_789012',
        device_type: 'ios'
      },
      {
        membre_id: paulId,
        token: 'fcm_token_paul_android_345678',
        device_type: 'android'
      }
    ]);
console.log(`✅ ${fcmTokens.length} tokens FCM créés\\n`);

    // 10. Création des logs d'audit
    console.log('📋 Insertion des logs d\'audit...');
    const auditLogs = await AuditLog.bulkCreate([
      {
        user_id: adminId,
        action: 'LOGIN',
        entity_type: 'auth',
        description: 'Connexion administrateur',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        created_at: new Date('2024-01-20')
      },
      {
        user_id: adminId,
        action: 'VALIDATE_PAYMENT',
        entity_type: 'cotisation',
        entity_id: cotisations[0].id,
        description: 'Validation de paiement',
        data_after: { montant: 500, membre_id: jeanId, statut: 'valide' },
        ip_address: '192.168.1.100',
        created_at: new Date('2024-01-21')
      },
      {
        user_id: jeanId,
        action: 'LOGIN',
        entity_type: 'auth',
        description: 'Connexion membre',
        ip_address: '192.168.1.101',
        created_at: new Date('2024-01-25')
      },
      {
        user_id: jeanId,
        action: 'COMPLETE_QUIZ',
        entity_type: 'quiz',
        entity_id: quiz1Id,
        description: 'Complétion quiz',
        data_after: { score: 15, quiz_id: quiz1Id },
        ip_address: '192.168.1.101',
        created_at: new Date('2024-01-25')
      }
    ]);
console.log(`✅ ${auditLogs.length} logs d'audit créés\\n`);

console.log('✨ Seeding terminé avec succès!\\n');
    console.log('📈 Résumé:');
    console.log(`   - ${configPoints.length} configurations de points`);
    console.log(`   - ${membres.length} membres (1 admin + ${membres.length - 1} membres)`);
    console.log(`   - ${referrals.length} referrals`);
    console.log(`   - ${cotisations.length} cotisations`);
    console.log(`   - ${podcasts.length} podcasts`);
    console.log(`   - ${formations.length} formations`);
    console.log(`   - ${modules.length} modules de formation`);
    console.log(`   - ${quizzes.length} quiz avec ${questions.length} questions`);
    console.log(`   - ${resultats.length} résultats de quiz`);
    console.log(`   - ${fcmTokens.length} tokens FCM`);
console.log(`   - ${auditLogs.length} logs d'audit\\n`);

    console.log('🔐 Identifiants de test:');
    console.log('   Admin: username=admin, password=password123');
    console.log('   Membre: username=jdupont, password=password123');
    console.log('   Membre: username=mpierre, password=password123');
    console.log('   Membre: username=pjoseph, password=password123');
    console.log('   Membre: username=scharles, password=password123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

// Exécuter si lancé directement
if (require.main === module) {
  seedDatabase()
    .then(() => {
console.log('\\n✅ Script de seeding terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
console.error('\\n❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
