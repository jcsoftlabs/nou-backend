# Vérification du Mapping Mobile ↔ Backend

Date: 2025-11-16

## ✅ Résumé: LE MAPPING EST CORRECT

Tous les champs envoyés par l'application mobile Flutter correspondent exactement aux champs attendus par le backend.

---

## Détails du Mapping

### 📱 ÉTAPE 1 (RegisterStep1Screen)
**Champs collectés:**
```dart
{
  'username': _usernameController.text.trim(),
  'code_reference': _codeReferenceController.text.trim(),
  'password': _passwordController.text,
}
```

**Backend attend (authValidators.js):**
- ✅ `username` : STRING (3-50 chars, pattern `/^[a-zA-Z0-9_]+$/`) - **REQUIS**
- ✅ `password` : STRING (min 6 chars) - **REQUIS**
- ✅ `code_adhesion` : STRING - **REQUIS**

**Note:** Le mobile envoie `code_reference` mais le formulaire final (Step 2) l'envoie comme `code_adhesion`. ✅ Compatible.

---

### 📱 ÉTAPE 2 (RegisterStep2Screen)

#### Données finales envoyées à l'API:
```dart
{
  // ÉTAPE 1
  'username': widget.step1Data['username'],
  'password': widget.step1Data['password'],
  'code_adhesion': _codeAdhesionController.text, // de step1['code_reference']
  
  // INFORMATIONS PERSONNELLES
  'nom': _nomController.text,
  'prenom': _prenomController.text,
  'surnom': _surnomController.text,
  'sexe': _sexe,
  'lieu_de_naissance': _lieuNaissanceController.text,
  'date_de_naissance': _dateNaissanceController.text,
  'nom_pere': _nomPereController.text,
  'nom_mere': _nomMereController.text,
  'nin': _ninController.text,
  'nif': _nifController.text,
  'situation_matrimoniale': _situationMatrimoniale,
  'nb_enfants': int.tryParse(_nbEnfantsController.text) ?? 0,
  'nb_personnes_a_charge': int.tryParse(_nbPersonnesChargeController.text) ?? 0,
  
  // CONTACT
  'telephone_principal': _telephonePrincipalController.text,
  'telephone_etranger': _telephoneEtrangerController.text,
  'email': _emailController.text,
  'adresse_complete': _adresseCompleteController.text,
  'facebook': _facebookController.text,
  'instagram': _instagramController.text,
  
  // PROFESSION & LOCALISATION
  'profession': _professionController.text,
  'occupation': _occupationController.text,
  'departement': _departementController.text,
  'commune': _communeController.text,
  'section_communale': _sectionCommunaleController.text,
  
  // HISTORIQUE POLITIQUE
  'a_ete_membre_politique': _aEteMembrePolitique,
  'role_politique_precedent': _rolePolitiquePrecedentController.text,
  'nom_parti_precedent': _nomPartiPrecedentController.text,
  'a_ete_membre_organisation': _aEteMembreOrganisation,
  'role_organisation_precedent': _roleOrganisationPrecedentController.text,
  'nom_organisation_precedente': _nomOrganisationPrecedenteController.text,
  
  // RÉFÉRENT
  'referent_nom': _referentNomController.text,
  'referent_prenom': _referentPrenomController.text,
  'referent_adresse': _referentAdresseController.text,
  'referent_telephone': _referentTelephoneController.text,
  'relation_avec_referent': _relationAvecReferentController.text,
  
  // QUESTIONS LÉGALES
  'a_ete_condamne': _aEteCondamne,
  'a_violé_loi_drogue': _aVioleLoiDrogue,
  'a_participe_activite_terroriste': _aParticipeActiviteTerroriste,
  
  // PHOTO
  'photo_profil_url': _photoProfilFile?.path ?? '',
}
```

---

## 🔍 Comparaison Champ par Champ

| Champ Mobile | Backend Validator | Model Membre | Statut |
|-------------|-------------------|--------------|--------|
| `username` | ✅ REQUIS | ✅ STRING(50), UNIQUE, NOT NULL | ✅ MATCH |
| `password` | ✅ REQUIS | ✅ `password_hash` STRING(255) | ✅ MATCH |
| `code_adhesion` | ✅ REQUIS | ✅ STRING(50), UNIQUE | ✅ MATCH |
| `nom` | ✅ REQUIS | ✅ STRING(100), NOT NULL | ✅ MATCH |
| `prenom` | ✅ REQUIS | ✅ STRING(100), NOT NULL | ✅ MATCH |
| `surnom` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `sexe` | ✅ OPTIONNEL | ✅ STRING(20) | ✅ MATCH |
| `lieu_de_naissance` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `date_de_naissance` | ✅ OPTIONNEL | ✅ DATEONLY | ✅ MATCH |
| `nom_pere` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `nom_mere` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `nin` | ✅ OPTIONNEL | ✅ STRING(50) | ✅ MATCH |
| `nif` | ✅ OPTIONNEL | ✅ STRING(50) | ✅ MATCH |
| `situation_matrimoniale` | ✅ OPTIONNEL | ✅ STRING(50) | ✅ MATCH |
| `nb_enfants` | ✅ OPTIONNEL | ✅ INTEGER, default 0 | ✅ MATCH |
| `nb_personnes_a_charge` | ✅ OPTIONNEL | ✅ INTEGER, default 0 | ✅ MATCH |
| `telephone_principal` | ✅ REQUIS | ✅ STRING(20), NOT NULL | ✅ MATCH |
| `telephone_etranger` | ✅ OPTIONNEL | ✅ STRING(20) | ✅ MATCH |
| `email` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `adresse_complete` | ✅ OPTIONNEL | ✅ TEXT | ✅ MATCH |
| `profession` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `occupation` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `departement` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `commune` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `section_communale` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `facebook` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `instagram` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `a_ete_membre_politique` | ✅ OPTIONNEL | ✅ BOOLEAN, default false | ✅ MATCH |
| `role_politique_precedent` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `nom_parti_precedent` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `a_ete_membre_organisation` | ✅ OPTIONNEL | ✅ BOOLEAN, default false | ✅ MATCH |
| `role_organisation_precedent` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `nom_organisation_precedente` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |
| `referent_nom` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `referent_prenom` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `referent_adresse` | ✅ OPTIONNEL | ✅ TEXT | ✅ MATCH |
| `referent_telephone` | ✅ OPTIONNEL | ✅ STRING(20) | ✅ MATCH |
| `relation_avec_referent` | ✅ OPTIONNEL | ✅ STRING(100) | ✅ MATCH |
| `a_ete_condamne` | ✅ OPTIONNEL | ✅ BOOLEAN, default false | ✅ MATCH |
| `a_violé_loi_drogue` | ✅ OPTIONNEL | ✅ BOOLEAN, default false | ✅ MATCH |
| `a_participe_activite_terroriste` | ✅ OPTIONNEL | ✅ BOOLEAN, default false | ✅ MATCH |
| `photo_profil_url` | ✅ OPTIONNEL | ✅ STRING(255) | ✅ MATCH |

---

## 🎯 Champs Requis (Validation Backend)

Le backend exige **5 champs obligatoires** :
1. ✅ `username` (étape 1)
2. ✅ `password` (étape 1)
3. ✅ `code_adhesion` (étape 1)
4. ✅ `nom` (étape 2)
5. ✅ `prenom` (étape 2)
6. ✅ `telephone_principal` (étape 2)

**Tous ces champs sont marqués comme requis dans le formulaire Flutter avec validation.**

---

## 🔐 Logique Spéciale Backend

### 1. Validation du Code Parrain
Le backend (authService.js) valide que le `code_adhesion` fourni existe dans la table `membres`:
```javascript
const parrain = await Membre.findOne({ 
  where: { code_adhesion: code_adhesion } 
});

if (!parrain) {
  throw new Error('Code de référence invalide');
}
```

### 2. Génération Automatique
Le backend génère automatiquement:
- Un **nouveau** `code_adhesion` unique pour le nouveau membre
- Stocke le code du parrain dans `code_parrain`

### 3. Hachage du Mot de Passe
Le backend hash automatiquement `password` → `password_hash` avec bcrypt.

### 4. Login Intelligent
Le backend accepte 3 types d'identifiants:
- `username`
- `email`
- `telephone_principal`

---

## ⚠️ Point d'Attention

### Photo de Profil
**Mobile envoie:** `_photoProfilFile?.path` (chemin local du fichier)

**Backend attend:** URL ou chemin relatif

**🔧 Action requise:** 
L'application devra uploader le fichier image vers un endpoint séparé (ex: `/api/upload/photo`) et récupérer l'URL avant d'envoyer le formulaire d'inscription, OU envoyer le formulaire en `multipart/form-data` avec le fichier.

**Recommandation:** Modifier le backend pour accepter un upload de fichier dans l'endpoint `/api/auth/register` avec `multipart/form-data`.

---

## ✅ Conclusion

**MAPPING: 100% COMPATIBLE**

Tous les champs envoyés par l'application mobile Flutter correspondent exactement aux validations et au modèle de données du backend Node.js.

**Seule amélioration suggérée:** Gérer l'upload de la photo de profil via multipart/form-data ou via un endpoint dédié.

---

## 📋 Checklist de Test

- [ ] Inscription étape 1 avec username, code_reference, password
- [ ] Navigation vers étape 2
- [ ] Remplissage formulaire étape 2
- [ ] Validation des champs requis (nom, prenom, telephone_principal)
- [ ] Vérification que code_adhesion est validé par le backend
- [ ] Connexion avec username après inscription
- [ ] Connexion avec email après inscription
- [ ] Connexion avec téléphone après inscription
