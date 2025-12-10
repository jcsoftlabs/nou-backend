const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route de test
app.get('/', (req, res) => {
  res.send('API NOU OK');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const membreRoutes = require('./routes/membreRoutes');
const cotisationRoutes = require('./routes/cotisationRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const referralRoutes = require('./routes/referralRoutes');
const parrainageRoutes = require('./routes/parrainageRoutes');
const pointsRoutes = require('./routes/pointsRoutes');
const podcastRoutes = require('./routes/podcastRoutes');
const quizRoutes = require('./routes/quizRoutes');
const formationRoutes = require('./routes/formationRoutes');
const donRoutes = require('./routes/donRoutes');
const newsRoutes = require('./routes/newsRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const albumRoutes = require('./routes/albumRoutes');
// const fcmRoutes = require('./routes/fcmRoutes'); // Désactivé temporairement
const adminRoutes = require('./routes/adminRoutes');

app.use('/auth', authRoutes);
app.use('/membres', membreRoutes);
app.use('/cotisations', cotisationRoutes);
app.use('/payments', webhookRoutes);
app.use('/referrals', referralRoutes);
app.use('/parrainage', parrainageRoutes);
app.use('/points', pointsRoutes);
app.use('/podcasts', podcastRoutes);
app.use('/quiz', quizRoutes);
app.use('/formations', formationRoutes);
app.use('/dons', donRoutes);
app.use('/news', newsRoutes);
app.use('/annonces', annonceRoutes);
app.use('/albums', albumRoutes);
// app.use('/fcm', fcmRoutes); // Désactivé temporairement
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 4000;

// Gestionnaires d'erreurs globaux
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

// Assurer que le serveur reste actif
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT reçu, arrêt gracieux...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});
