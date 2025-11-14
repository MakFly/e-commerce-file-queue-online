#!/bin/bash

echo "🚀 Configuration rapide pour tester la file d'attente..."
echo ""

# Créer le .env pour le backend avec limite à 1 utilisateur
echo "📝 Configuration du backend (limite: 1 utilisateur)..."
cp backend/.env.testing backend/.env

# Créer le .env.local pour le frontend
echo "📝 Configuration du frontend..."
if [ ! -f frontend/.env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
fi

echo ""
echo "🐳 Démarrage de Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage des services (30 secondes)..."
sleep 30

echo ""
echo "✅ Application prête !"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CONFIGURATION ACTUELLE :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Utilisateurs simultanés max : 1"
echo "   File d'attente activée : OUI"
echo ""
echo "🧪 COMMENT TESTER :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   1️⃣  Ouvrez votre navigateur normal :"
echo "      → http://localhost:3000"
echo "      → Vous verrez les PRODUITS ✅"
echo ""
echo "   2️⃣  Ouvrez une fenêtre INCOGNITO :"
echo "      → http://localhost:3000"
echo "      → Vous verrez la FILE D'ATTENTE 🕒"
echo ""
echo "   3️⃣  Fermez la première fenêtre"
echo "      → La deuxième sera activée automatiquement ! 🎉"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 LIENS UTILES :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Frontend :  http://localhost:3000"
echo "   Backend  :  http://localhost:8000"
echo "   Stats API:  http://localhost:8000/api/queue/stats"
echo ""
echo "📋 COMMANDES UTILES :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Logs backend :      docker-compose logs -f backend"
echo "   Logs frontend :     docker-compose logs -f frontend"
echo "   Redis CLI :         docker-compose exec redis redis-cli"
echo "   Voir actifs :       docker-compose exec redis redis-cli SCARD queue:active_users"
echo "   Voir en attente :   docker-compose exec redis redis-cli ZCARD queue:waiting"
echo "   Arrêter :           docker-compose down"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
