#!/bin/bash

echo "🚀 Push vers GitHub avec Personal Access Token"
echo ""
echo "📝 Assurez-vous d'avoir :"
echo "   1. Créé le repository 'nou-backend' sur GitHub"
echo "   2. Généré un Personal Access Token"
echo ""

read -p "Entrez votre GitHub Personal Access Token: " TOKEN

if [ -z "$TOKEN" ]; then
  echo "❌ Token requis"
  exit 1
fi

echo ""
echo "🔧 Configuration du remote..."

# Configurer le remote avec le token
git remote set-url origin https://$TOKEN@github.com/jcsoftlabs/nou-backend.git

echo "⬆️  Push en cours..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Code poussé avec succès !"
  echo "🔗 Repository: https://github.com/jcsoftlabs/nou-backend"
  echo ""
  echo "📝 Prochaines étapes :"
  echo "1. Ouvrir Railway Dashboard"
  echo "2. New → Deploy from GitHub repo"
  echo "3. Sélectionner 'nou-backend'"
  echo "4. Configurer les variables d'environnement"
  echo ""
  echo "📄 Voir DEPLOYMENT_INSTRUCTIONS.md pour plus de détails"
else
  echo ""
  echo "❌ Erreur lors du push"
  echo "Vérifiez que :"
  echo "  - Le repository existe sur GitHub"
  echo "  - Le token est valide"
  echo "  - Vous avez les permissions nécessaires"
fi
