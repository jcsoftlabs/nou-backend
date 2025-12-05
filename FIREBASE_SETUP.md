# Configuration Firebase Cloud Messaging

Ce guide explique comment configurer Firebase Cloud Messaging (FCM) pour envoyer des notifications push aux membres de l'application NOU.

## Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Donnez un nom à votre projet (ex: "NOU App")

### 2. Obtenir le fichier de clé privée

1. Dans Firebase Console, allez dans **Paramètres du projet** (icône engrenage en haut à gauche)
2. Allez dans l'onglet **Comptes de service**
3. Cliquez sur **Générer une nouvelle clé privée**
4. Un fichier JSON sera téléchargé

### 3. Installer le fichier de configuration

1. Renommez le fichier téléchargé en `firebase-service-account.json`
2. Placez-le dans le dossier `src/config/` de votre projet
3. **IMPORTANT**: Ajoutez ce fichier à `.gitignore` pour ne pas le commiter

```bash
# Dans .gitignore
src/config/firebase-service-account.json
```

### 4. Configuration alternative avec variable d'environnement

Vous pouvez aussi définir le chemin du fichier via une variable d'environnement dans votre `.env` :

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/chemin/vers/firebase-service-account.json
```

## Utilisation des endpoints

### Pour les membres (authentifiés)

#### Enregistrer un token FCM
```http
POST /fcm/register
Authorization: Bearer {token_jwt}
Content-Type: application/json

{
  "token": "TOKEN_FCM_DU_DEVICE",
  "device_type": "android" // ou "ios", "web"
}
```

#### Désactiver un token FCM
```http
DELETE /fcm/unregister
Authorization: Bearer {token_jwt}
Content-Type: application/json

{
  "token": "TOKEN_FCM_DU_DEVICE"
}
```

### Pour les admins

#### Envoyer une notification personnalisée à tous les membres
```http
POST /fcm/notify
Authorization: Bearer {admin_token_jwt}
Content-Type: application/json

{
  "title": "Nouvelle annonce !",
  "body": "Une assemblée générale aura lieu le 25 janvier",
  "target_type": "all",
  "data": {
    "type": "announcement",
    "action": "open_announcements"
  }
}
```

#### Envoyer une notification à des membres spécifiques
```http
POST /fcm/notify
Authorization: Bearer {admin_token_jwt}
Content-Type: application/json

{
  "title": "Message important",
  "body": "Veuillez consulter vos messages",
  "target_type": "specific",
  "target_ids": [1, 5, 12, 23],
  "data": {
    "type": "message",
    "action": "open_messages"
  }
}
```

#### Obtenir les statistiques FCM
```http
GET /fcm/stats
Authorization: Bearer {admin_token_jwt}
```

Réponse :
```json
{
  "success": true,
  "data": {
    "total": 150,
    "actifs": 142,
    "inactifs": 8,
    "by_device": {
      "android": 120,
      "ios": 20,
      "web": 2
    }
  }
}
```

## Notifications automatiques

### Live Podcast
Lorsqu'un admin démarre un live podcast via `POST /podcasts/live/start`, une notification est automatiquement envoyée à tous les membres avec un token FCM actif.

Format de la notification :
- **Titre**: "🔴 Live en cours !"
- **Corps**: "{Titre du podcast} est maintenant en direct"
- **Data**: 
  - `type`: "podcast_live"
  - `podcast_id`: ID du podcast
  - `action`: "open_podcast"

## Côté client (application mobile)

### Android (Kotlin/Java)
```kotlin
// Obtenir le token FCM
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        // Envoyer le token au backend via POST /fcm/register
        registerTokenToBackend(token)
    }
}
```

### iOS (Swift)
```swift
// Obtenir le token FCM
Messaging.messaging().token { token, error in
    if let token = token {
        // Envoyer le token au backend via POST /fcm/register
        registerTokenToBackend(token)
    }
}
```

### Web (JavaScript)
```javascript
// Dans votre service worker
import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();
getToken(messaging, { vapidKey: 'VOTRE_VAPID_KEY' })
  .then((currentToken) => {
    if (currentToken) {
      // Envoyer le token au backend via POST /fcm/register
      registerTokenToBackend(currentToken);
    }
  });
```

## Sécurité

1. **Ne JAMAIS commiter** le fichier `firebase-service-account.json`
2. Restreindre les permissions du fichier : `chmod 600 src/config/firebase-service-account.json`
3. En production, utiliser des variables d'environnement ou un gestionnaire de secrets (AWS Secrets Manager, HashiCorp Vault, etc.)

## Dépannage

### Erreur "Firebase Admin SDK n'est pas initialisé"
- Vérifiez que le fichier `firebase-service-account.json` existe dans `src/config/`
- Vérifiez les permissions du fichier
- Consultez les logs du serveur au démarrage

### Tokens invalides
Le système désactive automatiquement les tokens invalides (device désinstallé, token expiré, etc.). Pas d'action requise.

### Notifications non reçues
1. Vérifiez que le token est enregistré : `GET /fcm/stats`
2. Vérifiez que le device a autorisé les notifications
3. Consultez les logs serveur pour voir si l'envoi a réussi
4. Testez avec l'endpoint `POST /fcm/notify` pour une notification manuelle
