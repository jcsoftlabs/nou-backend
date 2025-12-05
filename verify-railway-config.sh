#!/bin/bash

echo "🔍 Vérification de la configuration du backend Railway"
echo ""

BACKEND_URL="https://nou-backend-production.up.railway.app"

echo "1️⃣  Test de base (root endpoint)..."
curl -s "$BACKEND_URL" 
echo ""
echo ""

echo "2️⃣  Test de connexion admin..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"password123"}')

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Vérifier si la connexion a réussi
if echo "$RESPONSE" | grep -q '"token"'; then
  echo "✅ Connexion admin réussie !"
  echo ""
  
  # Extraire le token
  TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)
  
  if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "3️⃣  Test d'un endpoint authentifié (liste des membres)..."
    curl -s "$BACKEND_URL/membres" \
      -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || echo "Erreur lors de la récupération"
  fi
elif echo "$RESPONSE" | grep -q "ECONNREFUSED"; then
  echo "❌ ERREUR: Le backend ne peut pas se connecter à la base de données"
  echo "   Vérifiez que les variables d'environnement sont configurées sur Railway:"
  echo "   - DB_HOST=mainline.proxy.rlwy.net"
  echo "   - DB_PORT=18580"
  echo "   - DB_USER=root"
  echo "   - DB_PASS=VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz"
  echo "   - DB_NAME=railway"
else
  echo "❌ Connexion échouée"
  echo "   Raison: $(echo "$RESPONSE" | jq -r '.message' 2>/dev/null || echo "$RESPONSE")"
fi

echo ""
echo "📋 Pour voir les logs Railway:"
echo "   railway logs"
echo ""
echo "🔧 Pour ouvrir le dashboard Railway:"
echo "   railway open"
