# Logique de Cotisation - Backend NOU

## 📅 Période d'Adhésion

### Principe
La cotisation annuelle est calculée sur une **période de 12 mois à partir de la date d'adhésion du membre**, et non sur l'année civile (janvier-décembre).

### Exemple
- **Membre A** adhère le **15 mars 2024**
  - Sa période de cotisation : **15 mars 2024 → 14 mars 2025**
  - La suivante : **15 mars 2025 → 14 mars 2026**

- **Membre B** adhère le **20 juillet 2024**
  - Sa période de cotisation : **20 juillet 2024 → 19 juillet 2025**
  - La suivante : **20 juillet 2025 → 19 juillet 2026**

### Avantages
✅ **Équitable** : Chaque membre a une période complète de 12 mois  
✅ **Flexible** : Les membres peuvent adhérer à tout moment de l'année  
✅ **Clair** : La date d'échéance correspond à l'anniversaire d'adhésion

## 💰 Règles de Cotisation

### Montants
- **Cotisation annuelle** : 1 500 HTG par période de 12 mois
- **Premier versement minimum** : 150 HTG
- **Versements suivants** : Montant libre (minimum 1 HTG)
- **Maximum par versement** : 1 500 HTG

### Validation
1. Le **premier versement** de chaque période doit être ≥ 150 HTG
2. Le **total des versements** sur la période ne peut pas dépasser 1 500 HTG
3. Un membre peut effectuer **plusieurs versements** dans sa période

### Exemples de Scénarios

#### Scénario 1 : Paiement en plusieurs fois
Membre adhère le 1er janvier 2024 :
- ✅ **1er versement** : 150 HTG (15 janvier 2024) → Validé
- ✅ **2ème versement** : 500 HTG (15 mars 2024) → Validé (total: 650 HTG)
- ✅ **3ème versement** : 850 HTG (15 mai 2024) → Validé (total: 1 500 HTG)
- ❌ **4ème versement** : 100 HTG (15 juin 2024) → **Rejeté** (dépasserait 1 500 HTG)

#### Scénario 2 : Paiement complet
Membre adhère le 15 juin 2024 :
- ✅ **1er versement** : 1 500 HTG (20 juin 2024) → Validé (cotisation complète)

#### Scénario 3 : Premier versement insuffisant
Membre adhère le 10 avril 2024 :
- ❌ **1er versement** : 100 HTG (12 avril 2024) → **Rejeté** (minimum 150 HTG requis)
- ✅ **1er versement** : 200 HTG (13 avril 2024) → Validé

## 🔄 Renouvellement Automatique

À chaque anniversaire d'adhésion :
- Une **nouvelle période de cotisation** démarre automatiquement
- Le compteur est remis à 0
- Le premier versement doit à nouveau être ≥ 150 HTG

### Exemple de Renouvellement
Membre adhère le 5 septembre 2024 :

**Période 1** (5 sept 2024 → 4 sept 2025)
- Versements : 300 HTG + 600 HTG + 600 HTG = 1 500 HTG ✅

**Période 2** (5 sept 2025 → 4 sept 2026)
- Nouveau compteur : 0 HTG
- Premier versement requis : ≥ 150 HTG
- Nouveau plafond : 1 500 HTG

## 🔍 Fonctions Techniques

### `getTotalCotisationsAnnee(membreId)`
Calcule le total des cotisations validées pour la période d'adhésion en cours.

**Logique** :
1. Récupère la date d'adhésion du membre (`date_creation`)
2. Calcule l'anniversaire le plus récent
3. Définit la période : anniversaire → anniversaire + 12 mois
4. Somme toutes les cotisations validées dans cette période

### `isPremierVersementAnnee(membreId)`
Vérifie si c'est le premier versement de la période d'adhésion en cours.

**Logique** :
1. Calcule la période d'adhésion actuelle
2. Compte les cotisations validées dans cette période
3. Retourne `true` si aucune cotisation validée trouvée

## 📊 Impact sur les Statistiques

Les statistiques doivent prendre en compte que :
- Les périodes de cotisation sont **individuelles** par membre
- Un membre peut être à jour même si d'autres ne le sont pas
- Le **taux de complétion** doit être calculé membre par membre

## 🎯 Statuts de Membre

### Membre pré-adhérent
- Nouveau membre n'ayant pas encore payé sa première cotisation
- Peut payer à partir de 150 HTG

### Membre adhérent
- A effectué au moins un versement de cotisation
- Est à jour de cotisation pour sa période actuelle

### Calcul du statut "À jour"
Un membre est "à jour" si :
- `getTotalCotisationsAnnee(membreId) >= 1500` pour sa période actuelle

## 🔐 Sécurité

### Validation Côté Backend
Toutes les validations sont effectuées côté backend :
- Montant minimum du premier versement
- Plafond de 1 500 HTG par période
- Vérification de la période d'adhésion

### Rôles
- **Membre** : Peut créer une cotisation (en attente)
- **Admin** : Peut valider/rejeter les cotisations

## 📝 Notes de Migration

Si vous aviez des données avec l'ancienne logique (année civile) :
- La nouvelle logique s'applique automatiquement
- Les cotisations passées restent valides
- Les nouveaux calculs utilisent la date d'adhésion

## 🚀 Déploiement

Cette logique a été déployée le : **5 décembre 2024**

Commit: `f9ce269 - Fix: Use member's join date instead of calendar year for cotisation period`
