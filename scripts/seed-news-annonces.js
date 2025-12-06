const { sequelize, Membre, News, Annonce } = require('../src/models');

async function seedNewsEtAnnonces() {
  try {
    console.log('📰 Seeding des news et annonces...');

    await sequelize.authenticate();
    console.log('✅ Connexion DB ok');

    // On prend un auteur existant (admin) si possible
    const admin = await Membre.findOne({ where: { role_utilisateur: 'admin' } });
    const auteurId = admin ? admin.id : null;

    const maintenant = new Date();

    // --- NEWS ---
    const newsData = [
      {
        titre: "Lancement officiel de l'application NOUMOBILE",
        slug: 'lancement-officiel-noumobile',
        resume: "Découvrez les fonctionnalités principales de la nouvelle application mobile du mouvement NOU.",
        contenu: "L'application NOUMOBILE est maintenant disponible pour permettre aux membres de suivre l'actualité, leurs cotisations, leurs points et de participer aux formations depuis leur téléphone.",
        categorie: 'Actualités',
        image_couverture_url: null,
        est_publie: true,
        date_publication: new Date(maintenant.getTime() - 3 * 24 * 60 * 60 * 1000),
        auteur_id: auteurId
      },
      {
        titre: 'Nouvelle formation: Engagement citoyen',
        slug: 'formation-engagement-citoyen',
        resume: 'Une série de modules pour mieux comprendre le rôle du citoyen dans la société haïtienne.',
        contenu: "Cette formation propose plusieurs modules autour de l'engagement civique, des institutions et de la participation des jeunes.",
        categorie: 'Formations',
        image_couverture_url: null,
        est_publie: true,
        date_publication: new Date(maintenant.getTime() - 2 * 24 * 60 * 60 * 1000),
        auteur_id: auteurId
      },
      {
        titre: 'Mise à jour des règles de cotisation',
        slug: 'mise-a-jour-regles-cotisation',
        resume: 'Les règles de calcul des cotisations ont été adaptées pour mieux prendre en compte la date d’adhésion.',
        contenu: "Les cotisations sont désormais calculées sur la base de la période d'adhésion de chaque membre. Consultez votre profil pour voir votre statut.",
        categorie: 'Cotisations',
        image_couverture_url: null,
        est_publie: true,
        date_publication: new Date(maintenant.getTime() - 1 * 24 * 60 * 60 * 1000),
        auteur_id: auteurId
      }
    ];

    const newsCreees = await News.bulkCreate(newsData, { ignoreDuplicates: true });
    console.log(`✅ ${newsCreees.length} articles de news insérés`);

    // --- ANNONCES ---
    const annoncesData = [
      {
        titre: 'Réunion générale des membres',
        message: "Une réunion générale des membres aura lieu dimanche prochain à 10h. Merci d'arriver 15 minutes en avance.",
        priorite: 'important',
        statut: 'publie',
        date_publication: maintenant,
        date_expiration: new Date(maintenant.getTime() + 7 * 24 * 60 * 60 * 1000),
        auteur_id: auteurId
      },
      {
        titre: 'Maintenance planifiée du serveur',
        message: "Le backend sera indisponible ce samedi entre 22h et minuit pour une opération de maintenance.",
        priorite: 'info',
        statut: 'publie',
        date_publication: maintenant,
        date_expiration: new Date(maintenant.getTime() + 2 * 24 * 60 * 60 * 1000),
        auteur_id: auteurId
      },
      {
        titre: 'Urgent: Mise à jour obligatoire de NOUMOBILE',
        message: "Merci de mettre à jour l'application NOUMOBILE vers la dernière version afin de continuer à recevoir les notifications.",
        priorite: 'urgent',
        statut: 'publie',
        date_publication: maintenant,
        date_expiration: new Date(maintenant.getTime() + 14 * 24 * 60 * 60 * 1000),
        auteur_id: auteurId
      }
    ];

    const annoncesCreees = await Annonce.bulkCreate(annoncesData);
    console.log(`✅ ${annoncesCreees.length} annonces insérées`);

    console.log('🎉 Seeding des news et annonces terminé avec succès');
  } catch (err) {
    console.error('❌ Erreur pendant le seeding des news/annonces:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedNewsEtAnnonces();
}

module.exports = seedNewsEtAnnonces;
