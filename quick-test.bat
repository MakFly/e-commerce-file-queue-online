@echo off
echo.
echo 🚀 Configuration rapide pour tester la file d'attente...
echo.

REM Créer le .env pour le backend avec limite à 1 utilisateur
echo 📝 Configuration du backend (limite: 1 utilisateur)...
copy backend\.env.testing backend\.env

REM Créer le .env.local pour le frontend
echo 📝 Configuration du frontend...
if not exist frontend\.env.local (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > frontend\.env.local
)

echo.
echo 🐳 Démarrage de Docker Compose...
docker-compose up -d

echo.
echo ⏳ Attente du démarrage des services (30 secondes)...
timeout /t 30 /nobreak > nul

echo.
echo ✅ Application prête !
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 CONFIGURATION ACTUELLE :
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    Utilisateurs simultanés max : 1
echo    File d'attente activée : OUI
echo.
echo 🧪 COMMENT TESTER :
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    1️⃣  Ouvrez votre navigateur normal :
echo       → http://localhost:3000
echo       → Vous verrez les PRODUITS ✅
echo.
echo    2️⃣  Ouvrez une fenêtre INCOGNITO :
echo       → http://localhost:3000
echo       → Vous verrez la FILE D'ATTENTE 🕒
echo.
echo    3️⃣  Fermez la première fenêtre
echo       → La deuxième sera activée automatiquement ! 🎉
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔗 LIENS UTILES :
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    Frontend :  http://localhost:3000
echo    Backend  :  http://localhost:8000
echo    Stats API:  http://localhost:8000/api/queue/stats
echo.
echo 📋 COMMANDES UTILES :
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo    Logs backend :      docker-compose logs -f backend
echo    Logs frontend :     docker-compose logs -f frontend
echo    Arrêter :           docker-compose down
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
