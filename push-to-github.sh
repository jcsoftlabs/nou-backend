#!/bin/bash

# Script pour pousser le code vers GitHub
# Remplacez YOUR_GITHUB_USERNAME par votre nom d'utilisateur GitHub

echo "📦 Préparation du push vers GitHub..."

# Vérifier que le commit existe
if ! git log --oneline -1 > /dev/null 2>&1; then
  echo "❌ Aucun commit trouvé. Veuillez d'abord faire un commit."
  exit 1
fi

# Demander le nom d'utilisateur GitHub
read -p "Entrez votre nom d'utilisateur GitHub: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
  echo "❌ Nom d'utilisateur requis"
  exit 1
fi

# Configuration du remote
REPO_URL="https://github.com/$GITHUB_USERNAME/nou-backend.git"

echo "🔗 Configuration du remote: $REPO_URL"

# Supprimer l'ancien remote s'il existe
git remote remove origin 2>/dev/null

# Ajouter le nouveau remote
git remote add origin "$REPO_URL"

# Vérifier la branche
BRANCH=$(git branch --show-current)
echo "📍 Branche actuelle: $BRANCH"

# Pousser vers GitHub
echo "⬆️  Push vers GitHub..."
git push -u origin "$BRANCH"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Code poussé avec succès vers GitHub!"
  echo "🔗 Repository: https://github.com/$GITHUB_USERNAME/nou-backend"
  echo ""
  echo "📝 Prochaines étapes:"
  echo "1. Allez sur Railway Dashboard: https://railway.com"
  echo "2. Cliquez sur 'New Project'"
  echo "3. Sélectionnez 'Deploy from GitHub repo'"
  echo "4. Choisissez 'nou-backend'"
  echo "5. Configurez les variables d'environnement"
else
  echo ""
  echo "❌ Erreur lors du push"
  echo "💡 Assurez-vous d'avoir:"
  echo "   - Créé le repository sur GitHub"
  echo "   - Les bonnes permissions d'accès"
  echo "   - Une connexion internet stable"
fi
