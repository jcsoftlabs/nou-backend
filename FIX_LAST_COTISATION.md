# Fix : Endpoint manquant pour récupérer la dernière cotisation

## Problème identifié

L'application mobile ne récupérait pas la dernière cotisation validée de Jean Dupont, même si elle était présente et validée dans la base de données.

### Cause racine
Le backend **n'avait pas d'endpoint** pour récupérer la dernière cotisation d'un membre. L'application mobile appelait `/cotisations/last/:membreId` mais cette route n'existait pas.

## Solution implémentée

### 1. Service (`src/services/cotisationService.js`)
Ajout de la fonction `getLastCotisation` :

```javascript
const getLastCotisation = async (membreId) => {
  try {
    const cotisation = await Cotisation.findOne({
      where: { membre_id: membreId },
      order: [['date_paiement', 'DESC']],
      limit: 1
    });
    
    return cotisation;
    
  } catch (error) {
    throw error;
  }
};
```

### 2. Contrôleur (`src/controllers/cotisationController.js`)
Ajout du contrôleur `getLastCotisation` :

```javascript
const getLastCotisation = async (req, res) => {
  try {
    const { membreId } = req.params;
    
    const cotisation = await cotisationService.getLastCotisation(membreId);
    
    if (!cotisation) {
      return res.status(404).json({
        success: false,
        message: 'Aucune cotisation trouvée pour ce membre'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Dernière cotisation récupérée avec succès',
      data: cotisation
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière cotisation:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la dernière cotisation'
    });
  }
};
```

### 3. Routes (`src/routes/cotisationRoutes.js`)
Ajout de la route **AVANT** la route générique `/cotisations` :

```javascript
/**
 * @route   GET /cotisations/last/:membreId
 * @desc    Récupérer la dernière cotisation d'un membre
 * @access  Private
 */
router.get('/last/:membreId',
  authenticate,
  cotisationController.getLastCotisation
);
```

**Important** : Cette route doit être placée **avant** `router.get('/', ...)` pour éviter les conflits de routing.

## Comportement attendu

### Requête
```
GET /cotisations/last/1
Authorization: Bearer <token>
```

### Réponse (200 OK)
```json
{
  "success": true,
  "message": "Dernière cotisation récupérée avec succès",
  "data": {
    "id": 1,
    "membre_id": 1,
    "montant": "1500.00",
    "moyen_paiement": "recu_upload",
    "url_recu": "/uploads/receipts/recu-1732584000000.jpg",
    "statut_paiement": "valide",
    "date_paiement": "2025-11-25T20:00:00.000Z",
    "date_verification": "2025-11-25T21:30:00.000Z",
    "admin_verificateur_id": 2,
    "commentaire_verification": "Paiement validé"
  }
}
```

### Réponse (404 Not Found) - Aucune cotisation
```json
{
  "success": false,
  "message": "Aucune cotisation trouvée pour ce membre"
}
```

## Impact
- ✅ L'app mobile peut maintenant récupérer correctement la dernière cotisation d'un membre
- ✅ Le statut "Validé" s'affiche correctement dans l'app après validation par un admin
- ✅ Le badge "Actif" apparaît dans l'AppBar pour les membres avec cotisation validée
- ✅ La carte de cotisation sur le HomeScreen affiche le bon statut

## Tests à effectuer
1. Démarrer le backend : `node src/server.js`
2. Se connecter dans l'app mobile avec Jean Dupont
3. Vérifier que :
   - Le badge "Actif" apparaît dans l'AppBar
   - La cotisation validée s'affiche dans la page Cotisation
   - Le statut est "Validé" (vert)
