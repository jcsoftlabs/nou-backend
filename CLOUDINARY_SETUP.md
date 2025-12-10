# ☁️ Configuration Cloudinary pour la Médiathèque

## ✅ Pourquoi Cloudinary ?

La médiathèque utilise **Cloudinary** pour le stockage des images au lieu du stockage local. Cela résout plusieurs problèmes :

- ✅ **Persistance** : Les fichiers ne sont jamais perdus lors des redéploiements Railway
- ✅ **Performance** : CDN global pour une livraison rapide des images
- ✅ **Scalabilité** : Gère automatiquement des milliers d'images
- ✅ **Transformations** : Redimensionnement et optimisation à la volée
- ✅ **Sécurité** : Stockage sécurisé et fiable

---

## 📋 Configuration requise

### 1. Créer un compte Cloudinary

Si vous n'avez pas encore de compte :
1. Aller sur https://cloudinary.com/
2. S'inscrire gratuitement (plan gratuit généreux : 25 crédits/mois)
3. Récupérer vos credentials depuis le dashboard

### 2. Récupérer les credentials

Dans votre dashboard Cloudinary, vous trouverez :
- **Cloud Name** : `votre_cloud_name`
- **API Key** : `123456789012345`
- **API Secret** : `votre_api_secret`

---

## 🔧 Configuration dans Railway

### Ajouter les variables d'environnement

Dans votre projet Railway, ajouter ces 3 variables d'environnement :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

**Important** : Après l'ajout des variables, Railway redémarrera automatiquement l'application.

---

## 📁 Organisation sur Cloudinary

Les fichiers de la médiathèque sont organisés dans des dossiers :

```
nou/
├── albums/
│   ├── covers/           # Images de couverture des albums
│   └── photos/           # Photos des albums
├── podcasts/
│   ├── audio/
│   └── covers/
└── profiles/             # Photos de profil des membres
```

Cette organisation permet de :
- Séparer les différents types de médias
- Faciliter la gestion et la recherche
- Appliquer des transformations spécifiques par type

---

## 🔄 Processus d'upload

Lorsqu'une photo est uploadée vers un album :

1. **Upload temporaire** : Le fichier est d'abord reçu par Multer et stocké temporairement localement
2. **Upload Cloudinary** : Le fichier est transféré vers Cloudinary
3. **Enregistrement** : L'URL Cloudinary est enregistrée en base de données
4. **Nettoyage** : Le fichier temporaire local est supprimé

**Avantage** : Aucun fichier ne reste stocké sur Railway, tout est sur Cloudinary.

---

## 🌐 URLs des images

### Format des URLs Cloudinary

```
https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567/nou/albums/photos/album_photo_123.jpg
```

**Ces URLs sont :**
- ✅ Permanentes et fiables
- ✅ Distribuées via CDN global
- ✅ Directement utilisables dans le frontend
- ✅ Transformables à la volée

### Exemples de transformations

Cloudinary permet de transformer les images directement dans l'URL :

```
# Image originale
https://res.cloudinary.com/CLOUD_NAME/image/upload/v123/nou/albums/photo.jpg

# Redimensionner à 300px de largeur
https://res.cloudinary.com/CLOUD_NAME/image/upload/w_300/v123/nou/albums/photo.jpg

# Thumbnail 200x200
https://res.cloudinary.com/CLOUD_NAME/image/upload/w_200,h_200,c_fill/v123/nou/albums/photo.jpg

# Optimisation automatique
https://res.cloudinary.com/CLOUD_NAME/image/upload/q_auto,f_auto/v123/nou/albums/photo.jpg
```

---

## 🔍 Vérification de la configuration

### Tester si Cloudinary est configuré

```bash
# Dans le terminal de Railway ou localement
node -e "console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configuré ✅' : 'Non configuré ❌')"
```

### Logs de l'application

Au démarrage, l'application affichera :
- ✅ Si Cloudinary est configuré : Les uploads utiliseront Cloudinary
- ⚠️ Si Cloudinary n'est PAS configuré : `[Cloudinary] Configuration manquante - les URLs d'images ne seront pas persistantes.`

---

## 🎯 Mode développement local

### Avec Cloudinary (recommandé)

Créer un fichier `.env` à la racine du projet :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Autres variables
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nou_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=dev_secret
PORT=4000
```

### Sans Cloudinary (fallback local)

Si vous n'avez pas de compte Cloudinary pour le développement :
- Les fichiers seront stockés dans `src/uploads/albums/`
- Les URLs seront relatives : `/uploads/albums/photo.jpg`
- ⚠️ **Attention** : Ces fichiers ne seront pas persistants sur Railway

---

## 📊 Monitoring et quotas

### Plan gratuit Cloudinary

- **25 crédits/mois** (généreux pour un projet en démarrage)
- **Stockage** : 25 GB
- **Bande passante** : 25 GB/mois
- **Transformations** : 25 000/mois

### Surveiller l'usage

Dashboard Cloudinary → Usage & Stats

Si le quota est dépassé :
1. Optimiser les images avant upload (frontend)
2. Limiter le nombre d'albums/photos
3. Passer au plan payant si nécessaire

---

## 🔒 Sécurité

### Protection de l'API Secret

- ✅ Ne JAMAIS committer l'API Secret dans Git
- ✅ Utiliser des variables d'environnement
- ✅ L'API Secret est utilisé uniquement côté serveur (Node.js)

### URLs signées (optionnel)

Pour des images privées, Cloudinary permet de générer des URLs signées avec expiration. (Non implémenté actuellement mais possible si besoin)

---

## 🛠️ Maintenance

### Supprimer des images de Cloudinary

Lorsqu'un album ou une photo est supprimé via l'API :
- ✅ L'entrée en base de données est supprimée
- ✅ Le fichier sur Cloudinary est automatiquement supprimé
- Aucune action manuelle nécessaire

### Nettoyer manuellement

Si besoin, vous pouvez supprimer des fichiers orphelins depuis :
Dashboard Cloudinary → Media Library → `nou/albums/`

---

## ❓ FAQ

### Q: Que se passe-t-il si je n'configure pas Cloudinary ?
**R:** L'application fonctionnera en mode "fallback local". Les fichiers seront stockés temporairement mais **perdus à chaque redéploiement Railway**.

### Q: Puis-je changer de Cloud Name après ?
**R:** Oui, mais les URLs des images existantes changeront. Il faudrait migrer les fichiers ou mettre à jour toutes les URLs en base.

### Q: Cloudinary est-il obligatoire en production ?
**R:** **OUI**, fortement recommandé. Sans Cloudinary en production, les images seront perdues à chaque déploiement.

### Q: Puis-je utiliser un autre service (S3, etc.) ?
**R:** Oui, mais il faudra modifier le code dans `albumController.js` et `albumService.js` pour utiliser le SDK du service choisi.

---

## 📚 Ressources

- Documentation Cloudinary : https://cloudinary.com/documentation
- Upload API : https://cloudinary.com/documentation/image_upload_api_reference
- Transformations : https://cloudinary.com/documentation/image_transformations
- Node.js SDK : https://cloudinary.com/documentation/node_integration

---

**Date de création** : 10 décembre 2024
**Status** : Configuration requise pour la médiathèque
