# Instructions de Déploiement - NOU Backend

## Option 1 : Via GitHub (Recommandé)

### Étape 1 : Créer le repository GitHub
1. Allez sur https://github.com/new
2. Repository name: `nou-backend`
3. Private
4. Ne cochez rien (README, .gitignore, license)
5. Cliquez "Create repository"

### Étape 2 : Obtenir un Personal Access Token
1. Allez sur https://github.com/settings/tokens/new
2. Note: "NOU Backend Deploy"
3. Cochez : `repo` (Full control of private repositories)
4. Cliquez "Generate token"
5. **COPIEZ LE TOKEN** immédiatement

### Étape 3 : Pousser le code
```bash
# Configurer le remote avec votre token
git remote set-url origin https://YOUR_TOKEN@github.com/jcsoftlabs/nou-backend.git

# Pousser
git push -u origin main
```

Remplacez `YOUR_TOKEN` par le token que vous avez copié.

---

## Option 2 : Upload Direct dans Railway (Plus Simple)

### Étape 1 : Créer une archive
```bash
cd /Users/christopherjerome
tar -czf nou-backend.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='*.log' \
  nou-backend/
```

### Étape 2 : Déployer sur Railway
1. Allez sur https://railway.com
2. Cliquez sur votre projet "aware-renewal"
3. Cliquez "New" → "Empty Service"
4. Dans les paramètres du service :
   - Allez dans "Settings" → "Source"
   - Upload le fichier `nou-backend.tar.gz`
5. Configurez les variables d'environnement (voir ci-dessous)

---

## Option 3 : Railway CLI (Nécessite upgrade du plan)

```bash
railway link
railway up
```

---

## Variables d'Environnement à Configurer

Dans Railway Dashboard → Service → Variables :

```
PORT=4000
NODE_ENV=production
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=18580
DB_USER=root
DB_PASS=VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz
DB_NAME=railway
JWT_SECRET=nou_railway_jwt_secret_key_2024_secure
REFERRAL_BASE_POINTS=10
REFERRAL_PAYMENT_BONUS=5
```

---

## Connecter GitHub à Railway

Une fois le code sur GitHub :

1. Railway Dashboard → "New"
2. "Deploy from GitHub repo"
3. Connectez votre compte GitHub
4. Sélectionnez "jcsoftlabs/nou-backend"
5. Railway détectera automatiquement Node.js
6. Configurez les variables d'environnement
7. Le déploiement démarrera automatiquement

---

## Vérifier le Déploiement

Une fois déployé, Railway vous donnera une URL comme :
```
https://nou-backend-production.up.railway.app
```

Testez l'API :
```bash
curl https://[votre-url].railway.app
# Devrait retourner : "API NOU OK"
```

---

## Dépannage

### Le build échoue
- Vérifiez que `package.json` contient `"start": "node src/server.js"`
- Vérifiez les logs dans Railway Dashboard

### Erreurs de connexion DB
- Vérifiez que toutes les variables d'environnement sont configurées
- Testez la connexion DB depuis Railway logs

### Port déjà utilisé
- Railway définit automatiquement PORT, ne le définissez pas à 4000 en dur

---

## Support

Pour toute question :
- Documentation Railway : https://docs.railway.app
- GitHub Issues : https://github.com/jcsoftlabs/nou-backend/issues
