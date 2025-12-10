# 🚀 Déploiement de la fonctionnalité Médiathèque

## ✅ État actuel

### Backend - Terminé ✅
- [x] Code développé et testé localement
- [x] Migration SQL appliquée sur la base de production
- [x] Tous les fichiers créés et validés
- [x] Documentation complète rédigée

### À déployer
- [ ] Pousser le code sur Railway
- [ ] Vérifier le bon fonctionnement en production
- [ ] Intégrer le frontend (nou-admin)

---

## 📦 Déploiement sur Railway

### Option 1 : Via Git (Recommandé)

```bash
# 1. Vérifier que tous les fichiers sont présents
git status

# 2. Ajouter les nouveaux fichiers
git add src/models/Album.js
git add src/models/AlbumPhoto.js
git add src/services/albumService.js
git add src/controllers/albumController.js
git add src/routes/albumRoutes.js
git add src/config/multerAlbum.js
git add src/migrations/012_create_albums_tables.sql
git add docs/API_ALBUMS.md
git add docs/FRONTEND_INTEGRATION_ALBUMS.md
git add README_MEDIATHEQUE.md
git add QUICK_START_MEDIATHEQUE.md
git add DEPLOIEMENT_MEDIATHEQUE.md

# 3. Modifier les fichiers existants
git add src/server.js
git add src/models/index.js

# 4. Commit
git commit -m "feat: ajout de la fonctionnalité médiathèque (albums photo)

- Création des modèles Album et AlbumPhoto
- Service métier albumService
- Contrôleur albumController avec gestion CRUD
- Routes publiques et admin pour les albums
- Configuration multer pour upload de photos
- Migration SQL appliquée en production
- Documentation API complète
- Guide d'intégration frontend"

# 5. Push vers Railway (ou votre remote)
git push origin main
# ou
git push railway main
```

### Option 2 : Via Railway CLI

```bash
# Installer Railway CLI si nécessaire
npm install -g @railway/cli

# Se connecter
railway login

# Sélectionner le projet
railway link

# Déployer
railway up
```

---

## ✅ Vérification post-déploiement

### 1. Tester l'API en production

```bash
# Test endpoint public - Liste des albums
curl https://nou-backend.railway.app/albums

# Réponse attendue (si aucun album) :
# {"success":true,"data":[],"pagination":{"total":0,"page":1,"limit":10,"pages":0}}

# Test santé de l'API
curl https://nou-backend.railway.app/
# Réponse attendue : "API NOU OK"
```

### 2. Tester la création d'un album (avec token admin)

```bash
# Remplacer YOUR_JWT_TOKEN par un vrai token admin
curl -X POST https://nou-backend.railway.app/albums/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "titre=Test Album Déploiement" \
  -F "description=Album de test après déploiement" \
  -F "est_public=true"

# Réponse attendue : 201 Created avec les détails de l'album
```

### 3. Vérifier le dossier uploads

```bash
# S'assurer que le dossier uploads/albums est accessible
curl -I https://nou-backend.railway.app/uploads/albums/
```

---

## 🔧 Configuration Railway

### Variables d'environnement requises

Vérifier que ces variables sont bien configurées dans Railway :

```env
PORT=4000
NODE_ENV=production

# Base de données (déjà configuré)
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=18580
DB_NAME=railway
DB_USER=root
DB_PASSWORD=VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz

# JWT
JWT_SECRET=votre_secret_jwt

# Autres variables si nécessaires
CORS_ORIGIN=*
```

### Volumes persistants (Important !)

⚠️ **ATTENTION** : Railway peut ne pas persister les fichiers uploadés lors des redéploiements.

**Solutions recommandées :**

1. **Volume persistant Railway** : Configurer un volume pour `/app/src/uploads`

2. **Stockage externe** (Recommandé pour la production) :
   - AWS S3
   - Cloudinary
   - DigitalOcean Spaces
   - Google Cloud Storage

Pour l'instant, les fichiers sont stockés localement. Considérer une migration vers un service de stockage cloud pour une solution plus robuste.

---

## 📋 Checklist de déploiement

### Avant le push
- [x] Tous les fichiers sont créés
- [x] Code testé localement
- [x] Migration SQL appliquée en production
- [x] Documentation complète
- [x] Pas d'erreurs de syntaxe

### Après le push
- [ ] Build Railway réussi
- [ ] Application démarrée sans erreurs
- [ ] Endpoint `/albums` répond (200)
- [ ] Endpoint admin `/albums/admin` protégé (401 sans token)
- [ ] Upload de fichiers fonctionne
- [ ] Fichiers accessibles via `/uploads/albums/`

### Tests fonctionnels
- [ ] Créer un album (admin)
- [ ] Ajouter des photos à un album
- [ ] Lister les albums (public)
- [ ] Voir les détails d'un album
- [ ] Modifier un album
- [ ] Supprimer une photo
- [ ] Supprimer un album

---

## 🔍 Troubleshooting

### Problème : Endpoint 404

**Cause possible** : Les routes ne sont pas montées correctement

**Solution** :
```javascript
// Vérifier dans src/server.js que la ligne suivante existe :
app.use('/albums', albumRoutes);
```

### Problème : Erreur 500 lors de la création

**Cause possible** : Tables non créées en base

**Solution** :
```bash
# Réappliquer la migration
mysql -h mainline.proxy.rlwy.net -P 18580 -u root -p railway < src/migrations/012_create_albums_tables.sql
```

### Problème : Upload ne fonctionne pas

**Cause possible** : Dossier uploads/albums n'existe pas

**Solution** : Le dossier est créé automatiquement par multerAlbum.js au premier upload. Vérifier les logs Railway.

### Problème : Images non accessibles

**Cause possible** : Route statique non configurée

**Solution** :
```javascript
// Vérifier dans src/server.js :
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

## 📊 Logs Railway

Pour vérifier les logs en temps réel :

```bash
# Via Railway CLI
railway logs

# Ou via le dashboard Railway
# https://railway.app/project/<PROJECT_ID>/deployments
```

Chercher les messages :
- `✅ Serveur démarré sur le port 4000`
- Erreurs liées à `Album`, `AlbumPhoto`, ou `albumRoutes`

---

## 🎯 Prochaines étapes

1. **Déployer le backend sur Railway** ✅
2. **Tester l'API en production** 
3. **Implémenter le frontend dans nou-admin**
4. **Tests utilisateur complets**
5. **Considérer la migration vers un stockage cloud** (optionnel mais recommandé)

---

## 📞 Support

Si des problèmes surviennent lors du déploiement :
1. Vérifier les logs Railway
2. Tester les endpoints avec cURL
3. Vérifier que la migration SQL a bien été appliquée
4. S'assurer que toutes les variables d'environnement sont configurées

---

**Date de création** : 10 décembre 2024
**Status** : Backend prêt, déploiement en attente
