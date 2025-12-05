# Système de Cotisations Annuelles avec Versements

## 📋 Règles de cotisation

### Montants
- **Cotisation annuelle totale** : 1500 HTG
- **Montant minimum du premier versement** : 150 HTG
- **Montant minimum des versements suivants** : 1 HTG (théoriquement, mais recommandé > 100 HTG)
- **Montant maximum par versement** : 1500 HTG

### Période
- Les cotisations sont calculées par **année civile** (1er janvier au 31 décembre)
- Le total de tous les versements validés ne peut pas dépasser 1500 HTG par an

### Validation
- Chaque versement doit être **validé par un administrateur**
- Seuls les versements avec `statut_paiement: 'valide'` comptent dans le total annuel
- Les versements `en_attente` ou `rejete` ne comptent pas

---

## 🔧 Endpoints API

### 1. Créer un versement de cotisation

**POST** `/cotisations`

**Headers**
```
Content-Type: multipart/form-data
```

**Body (form-data)**
- `membre_id` (number, requis) - ID du membre
- `montant` (number, requis) - Montant du versement (entre 150 et 1500 HTG)
- `moyen_paiement` (string, requis) - Méthode : `moncash`, `cash`, `recu_upload`
- `recu` (file, optionnel si moyen_paiement=`recu_upload`) - Fichier du reçu (JPG/PNG/PDF max 5MB)

**Validations automatiques**
✅ Vérifie que le membre existe
✅ Vérifie que le montant est >= 150 HTG si c'est le premier versement de l'année
✅ Vérifie que le total annuel ne dépasse pas 1500 HTG
✅ Vérifie qu'un reçu est fourni si `moyen_paiement = recu_upload`

**Exemple de requête**
```bash
curl -X POST http://localhost:4000/cotisations \
  -F "membre_id=123" \
  -F "montant=500" \
  -F "moyen_paiement=recu_upload" \
  -F "recu=@/path/to/receipt.jpg"
```

**Réponses possibles**

**Succès (201)**
```json
{
  "success": true,
  "message": "Cotisation créée avec succès",
  "data": {
    "id": 1,
    "membre_id": 123,
    "montant": "500.00",
    "statut_paiement": "en_attente",
    "url_recu": "/uploads/receipts/receipt_123_1234567890.jpg"
  }
}
```

**Erreur - Premier versement trop faible (400)**
```json
{
  "success": false,
  "message": "Le premier versement doit être d'au moins 150 HTG"
}
```

**Erreur - Dépassement du total annuel (400)**
```json
{
  "success": false,
  "message": "Le montant dépasse la cotisation annuelle. Vous avez déjà versé 1200 HTG. Il reste 300 HTG à payer."
}
```

**Erreur - Montant invalide (400)**
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "field": "montant",
      "message": "Le montant minimum est de 150 HTG"
    }
  ]
}
```

---

### 2. Consulter le statut de cotisation annuelle

**GET** `/cotisations/mon-statut`

**Headers**
```
Authorization: Bearer <access_token>
```

**Réponse (200)**
```json
{
  "success": true,
  "message": "Statut de cotisation récupéré avec succès",
  "data": {
    "annee": 2025,
    "montant_total_annuel": 1500,
    "montant_verse": 500,
    "montant_restant": 1000,
    "est_complet": false,
    "est_premier_versement": false,
    "montant_minimum_prochain_versement": 1
  }
}
```

**Champs de la réponse**
- `annee` : Année en cours
- `montant_total_annuel` : Total requis (1500 HTG)
- `montant_verse` : Total déjà versé et validé cette année
- `montant_restant` : Montant restant à payer
- `est_complet` : `true` si la cotisation annuelle est complète (>= 1500 HTG)
- `est_premier_versement` : `true` si aucun versement validé cette année
- `montant_minimum_prochain_versement` : 150 HTG si premier versement, sinon 1 HTG

---

### 3. Valider un versement (Admin)

**PUT** `/admin/cotisations/:id/valider`

**Headers**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body**
```json
{
  "commentaire": "Versement validé"
}
```

**Réponse (200)**
```json
{
  "success": true,
  "message": "Cotisation validée avec succès",
  "data": {
    "id": 1,
    "statut_paiement": "valide",
    "admin_verificateur_id": 1,
    "date_verification": "2025-11-26T00:00:00.000Z"
  }
}
```

---

### 4. Rejeter un versement (Admin)

**PUT** `/admin/cotisations/:id/rejeter`

**Headers**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body**
```json
{
  "commentaire": "Reçu invalide - montant incorrect"
}
```

---

## 📊 Exemples de scénarios

### Scénario 1 : Paiement en 3 versements

**Versement 1 (Janvier)** : 500 HTG ✅
- Premier versement : >= 150 HTG ✅
- Total annuel : 500 HTG
- Reste : 1000 HTG

**Versement 2 (Mars)** : 700 HTG ✅
- Total annuel : 1200 HTG
- Reste : 300 HTG

**Versement 3 (Juin)** : 300 HTG ✅
- Total annuel : 1500 HTG ✅ **COMPLET**
- Reste : 0 HTG

### Scénario 2 : Premier versement insuffisant

**Versement 1** : 100 HTG ❌
- Erreur : "Le premier versement doit être d'au moins 150 HTG"

### Scénario 3 : Tentative de dépassement

**Versements précédents** : 1400 HTG
**Nouveau versement** : 500 HTG ❌
- Erreur : "Le montant dépasse la cotisation annuelle. Vous avez déjà versé 1400 HTG. Il reste 100 HTG à payer."

### Scénario 4 : Paiement complet en une fois

**Versement unique** : 1500 HTG ✅
- Premier versement : >= 150 HTG ✅
- Total annuel : 1500 HTG ✅ **COMPLET**

---

## 🔐 Sécurité

- ✅ Authentification requise pour créer un versement
- ✅ Seuls les admins peuvent valider/rejeter
- ✅ Les versements sont en attente jusqu'à validation admin
- ✅ Logs d'audit pour toutes les actions (création, validation, rejet)
- ✅ Upload de reçus sécurisé (formats et tailles limités)

---

## 💡 Recommandations

1. **Pour les membres** :
   - Commencer par au moins 150 HTG pour le premier versement
   - Conserver les reçus de paiement
   - Vérifier régulièrement le statut avec `/cotisations/mon-statut`

2. **Pour les administrateurs** :
   - Vérifier les reçus avant validation
   - Ajouter un commentaire explicatif lors du rejet
   - Surveiller les tentatives de dépassement (peut indiquer une erreur)

3. **Intégration frontend** :
   - Afficher le statut de cotisation sur le dashboard membre
   - Calculer et suggérer le montant restant
   - Bloquer les versements < 150 HTG si c'est le premier
   - Afficher une alerte si tentative de dépassement
