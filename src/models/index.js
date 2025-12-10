const sequelize = require('../config/sequelize');
const Membre = require('./Membre');
const Cotisation = require('./Cotisation');
const Referral = require('./Referral');
const Podcast = require('./Podcast');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizResultat = require('./QuizResultat');
const AuditLog = require('./AuditLog');
const ConfigPoints = require('./ConfigPoints');
const FCMToken = require('./FCMToken');
const Formation = require('./Formation');
const ModuleFormation = require('./FormationModule');
const Don = require('./Don');
const News = require('./News');
const Annonce = require('./Annonce');
const Album = require('./Album');
const AlbumPhoto = require('./AlbumPhoto');

// Définir les associations

// Membre - Cotisations
Membre.hasMany(Cotisation, { foreignKey: 'membre_id', as: 'cotisations' });
Cotisation.belongsTo(Membre, { foreignKey: 'membre_id', as: 'membre' });

// Admin vérificateur - Cotisations
Membre.hasMany(Cotisation, { foreignKey: 'admin_verificateur_id', as: 'cotisations_verifiees' });
Cotisation.belongsTo(Membre, { foreignKey: 'admin_verificateur_id', as: 'admin_verificateur' });

// Membre - Dons
Membre.hasMany(Don, { foreignKey: 'membre_id', as: 'dons' });
Don.belongsTo(Membre, { foreignKey: 'membre_id', as: 'membre' });

// Admin vérificateur - Dons
Membre.hasMany(Don, { foreignKey: 'admin_verificateur_id', as: 'dons_verifies' });
Don.belongsTo(Membre, { foreignKey: 'admin_verificateur_id', as: 'admin_verificateur' });

// Referrals
Membre.hasMany(Referral, { foreignKey: 'parrain_id', as: 'filleuls' });
Membre.hasMany(Referral, { foreignKey: 'filleul_id', as: 'parrains' });
Referral.belongsTo(Membre, { foreignKey: 'parrain_id', as: 'parrain' });
Referral.belongsTo(Membre, { foreignKey: 'filleul_id', as: 'filleul' });

// Quiz - Questions
Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// Quiz - Résultats
Quiz.hasMany(QuizResultat, { foreignKey: 'quiz_id', as: 'resultats' });
QuizResultat.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// Membre - Résultats quiz
Membre.hasMany(QuizResultat, { foreignKey: 'membre_id', as: 'quiz_resultats' });
QuizResultat.belongsTo(Membre, { foreignKey: 'membre_id', as: 'membre' });

// Audit logs
Membre.hasMany(AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
AuditLog.belongsTo(Membre, { foreignKey: 'user_id', as: 'user' });

// FCM Tokens
Membre.hasMany(FCMToken, { foreignKey: 'membre_id', as: 'fcm_tokens' });
FCMToken.belongsTo(Membre, { foreignKey: 'membre_id', as: 'membre' });

// News / Articles
Membre.hasMany(News, { foreignKey: 'auteur_id', as: 'articles_news' });
News.belongsTo(Membre, { foreignKey: 'auteur_id', as: 'auteur' });

// Annonces
Membre.hasMany(Annonce, { foreignKey: 'auteur_id', as: 'annonces' });
Annonce.belongsTo(Membre, { foreignKey: 'auteur_id', as: 'auteur' });

// Albums - Membre (auteur)
Membre.hasMany(Album, { foreignKey: 'auteur_id', as: 'albums' });
Album.belongsTo(Membre, { foreignKey: 'auteur_id', as: 'auteur' });

// Album - Photos
Album.hasMany(AlbumPhoto, { foreignKey: 'album_id', as: 'photos' });
AlbumPhoto.belongsTo(Album, { foreignKey: 'album_id', as: 'album' });

// Formations - Modules - Quiz
Formation.hasMany(ModuleFormation, { foreignKey: 'formation_id', as: 'modules' });
ModuleFormation.belongsTo(Formation, { foreignKey: 'formation_id', as: 'formation' });

ModuleFormation.hasMany(Quiz, { foreignKey: 'module_id', as: 'quizzes' });
Quiz.belongsTo(ModuleFormation, { foreignKey: 'module_id', as: 'module' });

module.exports = {
  sequelize,
  Membre,
  Cotisation,
  Referral,
  Podcast,
  Quiz,
  QuizQuestion,
  QuizResultat,
  AuditLog,
  ConfigPoints,
  FCMToken,
  Formation,
  ModuleFormation,
  Don,
  News,
  Annonce,
  Album,
  AlbumPhoto
};
