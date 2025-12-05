# API Upload Photo de Profil - Inscription

## Endpoint
`POST /auth/register`

## Content-Type
`multipart/form-data`

## Description
Inscription d'un nouveau membre avec upload de photo de profil.

---

## Champs du Formulaire

### 🔐 Authentification (Requis)
| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| `username` | string | Nom d'utilisateur unique | 3-50 chars, `/^[a-zA-Z0-9_]+$/` |
| `password` | string | Mot de passe | Min 6 caractères |
| `code_adhesion` | string | Code de référence du parrain | Doit exister dans la DB |

### 👤 Informations Personnelles (Requis)
| Champ | Type | Description |
|-------|------|-------------|
| `nom` | string | Nom de famille |
| `prenom` | string | Prénom |
| `telephone_principal` | string | Téléphone principal |

### 📋 Informations Optionnelles
| Champ | Type | Description |
|-------|------|-------------|
| `surnom` | string | Surnom |
| `sexe` | string | "Masculin", "Féminin", "Autre" |
| `lieu_de_naissance` | string | Lieu de naissance |
| `date_de_naissance` | string | Format: YYYY-MM-DD |
| `nom_pere` | string | Nom du père |
| `nom_mere` | string | Nom de la mère |
| `nin` | string | Numéro d'Identification National |
| `nif` | string | Numéro d'Identification Fiscale |
| `situation_matrimoniale` | string | "Célibataire", "Marié(e)", etc. |
| `nb_enfants` | integer | Nombre d'enfants |
| `nb_personnes_a_charge` | integer | Nombre de personnes à charge |
| `telephone_etranger` | string | Téléphone étranger |
| `email` | string | Email |
| `adresse_complete` | string | Adresse complète |
| `profession` | string | Profession |
| `occupation` | string | Occupation |
| `departement` | string | Département |
| `commune` | string | Commune |
| `section_communale` | string | Section communale |
| `facebook` | string | Profil Facebook |
| `instagram` | string | Profil Instagram |

### 🏛️ Historique Politique
| Champ | Type | Description |
|-------|------|-------------|
| `a_ete_membre_politique` | boolean | A été membre d'un parti |
| `role_politique_precedent` | string | Rôle politique précédent |
| `nom_parti_precedent` | string | Nom du parti |
| `a_ete_membre_organisation` | boolean | A été membre d'une organisation |
| `role_organisation_precedent` | string | Rôle dans l'organisation |
| `nom_organisation_precedente` | string | Nom de l'organisation |

### 👥 Référent
| Champ | Type | Description |
|-------|------|-------------|
| `referent_nom` | string | Nom du référent |
| `referent_prenom` | string | Prénom du référent |
| `referent_adresse` | string | Adresse du référent |
| `referent_telephone` | string | Téléphone du référent |
| `relation_avec_referent` | string | Relation avec le référent |

### ⚖️ Questions Légales
| Champ | Type | Description |
|-------|------|-------------|
| `a_ete_condamne` | boolean | A déjà été condamné |
| `a_violé_loi_drogue` | boolean | A violé la loi sur les drogues |
| `a_participe_activite_terroriste` | boolean | A participé à activité terroriste |

### 📸 Photo de Profil
| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| `photo_profil` | File | Image de profil | jpeg, jpg, png, gif, webp. Max 5MB |

---

## Exemple de Requête (Flutter/Dart)

### Utilisation avec Dio

```dart
import 'package:dio/dio.dart';
import 'dart:io';

Future<Response> registerWithPhoto({
  required Map<String, dynamic> userData,
  File? photoFile,
}) async {
  final dio = Dio();
  
  // Créer FormData
  final formData = FormData();
  
  // Ajouter tous les champs texte
  userData.forEach((key, value) {
    if (value != null) {
      formData.fields.add(MapEntry(key, value.toString()));
    }
  });
  
  // Ajouter le fichier photo
  if (photoFile != null) {
    formData.files.add(MapEntry(
      'photo_profil',
      await MultipartFile.fromFile(
        photoFile.path,
        filename: photoFile.path.split('/').last,
      ),
    ));
  }
  
  // Envoyer la requête
  final response = await dio.post(
    'http://localhost:4000/auth/register',
    data: formData,
    options: Options(
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    ),
  );
  
  return response;
}
```

### Exemple d'utilisation

```dart
final userData = {
  'username': 'john_doe',
  'password': 'Password123',
  'code_adhesion': 'ABC123',
  'nom': 'Doe',
  'prenom': 'John',
  'telephone_principal': '+50937123456',
  'email': 'john.doe@example.com',
  'sexe': 'Masculin',
  'date_de_naissance': '1990-01-01',
  'adresse_complete': '123 Rue Exemple, Port-au-Prince',
  'a_ete_membre_politique': false,
  'a_ete_condamne': false,
  'a_violé_loi_drogue': false,
  'a_participe_activite_terroriste': false,
};

final photoFile = File('/path/to/photo.jpg');

try {
  final response = await registerWithPhoto(
    userData: userData,
    photoFile: photoFile,
  );
  
  print('Inscription réussie: ${response.data}');
} catch (e) {
  print('Erreur: $e');
}
```

---

## Réponse Succès (201)

```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "membre": {
      "id": 123,
      "username": "john_doe",
      "nom": "Doe",
      "prenom": "John",
      "code_adhesion": "ABC123456",
      "photo_profil_url": "/uploads/profils/john_doe_1234567890.jpg",
      "role_utilisateur": "membre",
      "date_creation": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Réponse Erreur (400)

```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "field": "username",
      "message": "Le nom d'utilisateur est requis"
    },
    {
      "field": "email",
      "message": "L'email doit être valide"
    }
  ]
}
```

---

## Réponse Erreur Upload (400)

```json
{
  "success": false,
  "message": "Seules les images sont autorisées (jpeg, jpg, png, gif, webp)"
}
```

---

## Notes Importantes

### 1. **Conversion des Types**
Les valeurs envoyées via `FormData` sont automatiquement des **strings**. Le backend convertit automatiquement :
- Les booléens : `"true"` → `true`, `"false"` → `false`
- Les entiers : `"5"` → `5`

### 2. **Photo Optionnelle**
La photo de profil est **optionnelle**. Si aucun fichier n'est envoyé, l'inscription fonctionnera quand même.

### 3. **Taille Maximum**
La taille maximale du fichier est de **5MB**.

### 4. **Formats Acceptés**
- JPEG / JPG
- PNG
- GIF
- WebP

### 5. **URL de la Photo**
Après upload, la photo est accessible via :
```
http://localhost:4000/uploads/profils/username_timestamp.jpg
```

### 6. **Sécurité**
- Le nom du fichier est automatiquement généré : `{username}_{timestamp}.{extension}`
- Les caractères spéciaux sont évités
- Le type MIME est vérifié

---

## Test avec cURL

```bash
curl -X POST http://localhost:4000/auth/register \
  -F "username=john_doe" \
  -F "password=Password123" \
  -F "code_adhesion=ABC123" \
  -F "nom=Doe" \
  -F "prenom=John" \
  -F "telephone_principal=+50937123456" \
  -F "email=john@example.com" \
  -F "photo_profil=@/path/to/photo.jpg"
```

---

## Migration depuis JSON vers FormData

### Avant (JSON)
```javascript
const response = await axios.post('/auth/register', {
  username: 'john_doe',
  password: 'Password123',
  // ... autres champs
});
```

### Après (FormData)
```javascript
const formData = new FormData();
formData.append('username', 'john_doe');
formData.append('password', 'Password123');
// ... autres champs
formData.append('photo_profil', photoFile);

const response = await axios.post('/auth/register', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```
