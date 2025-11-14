# E-Commerce Platform with Queue System

Une application e-commerce complète avec un système de file d'attente intelligent pour gérer le trafic élevé, construite avec Laravel (backend) et Next.js (frontend).

## 🚀 Fonctionnalités

### Système de File d'Attente
- **Gestion automatique du trafic** : Limite le nombre d'utilisateurs simultanés sur le site
- **Salle d'attente virtuelle** : Interface élégante pour les utilisateurs en attente
- **Position en temps réel** : Affichage de la position dans la file et temps d'attente estimé
- **Heartbeat automatique** : Maintien de session pour les utilisateurs actifs
- **Nettoyage automatique** : Libération des sessions expirées

### Backend (Laravel)
- API RESTful pour la gestion de la file d'attente
- Middleware de contrôle d'accès basé sur Redis
- Gestion des sessions utilisateurs
- Support de bypass pour les administrateurs
- Statistiques en temps réel

### Frontend (Next.js)
- Interface utilisateur moderne et responsive
- Salle d'attente animée avec informations en temps réel
- Gestion automatique des sessions
- Rafraîchissement automatique de la position
- Design élégant avec Tailwind CSS

## ⚡ Quick Start - Tester la File d'Attente en 30 Secondes

### Option 1 : Script Automatique (Recommandé)

**Linux/Mac :**
```bash
./quick-test.sh
```

**Windows :**
```bash
quick-test.bat
```

Ce script :
- Configure automatiquement la limite à **1 utilisateur**
- Démarre tous les services Docker
- Affiche les instructions de test

### Option 2 : Manuel

```bash
# 1. Configurer pour les tests
cp backend/.env.testing backend/.env

# 2. Démarrer Docker
docker-compose up -d

# 3. Attendre 30 secondes
sleep 30

# 4. Tester !
```

### 🧪 Comment Voir la File d'Attente

1. **Navigateur normal** → http://localhost:3000
   - ✅ Vous verrez les **PRODUITS**

2. **Fenêtre incognito** → http://localhost:3000
   - 🕒 Vous verrez la **FILE D'ATTENTE** !

3. **Fermez la première fenêtre**
   - 🎉 La deuxième sera **activée automatiquement** !

**Note :** La configuration de test limite à 1 utilisateur simultané, donc le 2ème utilisateur sera automatiquement en file d'attente.

Pour plus de détails, consultez [TESTING.md](TESTING.md).

## 📁 Structure du Projet

```
e-commerce-file-queue-online/
├── backend/                    # Application Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── QueueController.php
│   │   │   └── Middleware/
│   │   │       └── QueueMiddleware.php
│   ├── config/
│   │   ├── queue.php
│   │   ├── database.php
│   │   └── cors.php
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   └── Dockerfile
│
├── frontend/                   # Application Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── QueueWaitingRoom.tsx
│   │   │   └── ProductList.tsx
│   │   ├── hooks/
│   │   │   └── useQueue.ts
│   │   └── lib/
│   │       └── api.ts
│   └── Dockerfile
│
└── docker-compose.yml
```

## 🛠️ Technologies Utilisées

### Backend
- **Laravel 10** - Framework PHP
- **Redis** - Cache et gestion de file d'attente
- **MySQL 8.0** - Base de données
- **Predis** - Client Redis pour PHP

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Axios** - Client HTTP

### Infrastructure
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration des services

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git

## 🚀 Installation et Démarrage

### 1. Cloner le repository

```bash
git clone <repository-url>
cd e-commerce-file-queue-online
```

### 2. Configuration du Backend

```bash
cd backend
cp .env.example .env
```

Modifiez `.env` si nécessaire (les valeurs par défaut fonctionnent avec Docker).

### 3. Configuration du Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

### 4. Démarrer avec Docker Compose

```bash
# Depuis la racine du projet
docker-compose up -d
```

Cette commande va :
- Démarrer MySQL sur le port 3306
- Démarrer Redis sur le port 6379
- Démarrer Laravel sur le port 8000
- Démarrer un worker de queue Laravel
- Démarrer Next.js sur le port 3000

### 5. Initialiser la base de données

```bash
docker-compose exec backend php artisan migrate
```

### 6. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **MySQL** : localhost:3306
- **Redis** : localhost:6379

## 🎯 Comment Utiliser le Système de File d'Attente

### Configuration

Dans `backend/.env`, vous pouvez configurer :

```env
# Activer/Désactiver la file d'attente
QUEUE_ENABLED=true

# Nombre maximum d'utilisateurs simultanés
QUEUE_MAX_CONCURRENT_USERS=100

# Token de bypass pour les administrateurs
QUEUE_BYPASS_TOKEN=votre-token-secret
```

### Endpoints API

#### Vérifier le statut de la file
```bash
GET /api/queue/status?session_id=xxx
```

Réponse :
```json
{
  "status": "waiting",
  "position": 5,
  "queue_length": 20,
  "estimated_wait_seconds": 150,
  "active_users": 100,
  "max_users": 100
}
```

#### Heartbeat (garder la session active)
```bash
POST /api/queue/heartbeat
{
  "session_id": "xxx"
}
```

#### Libérer une session
```bash
POST /api/queue/release
{
  "session_id": "xxx"
}
```

#### Statistiques (admin)
```bash
GET /api/queue/stats
```

#### Nettoyage des sessions expirées
```bash
POST /api/queue/cleanup
```

### Bypass du Système de File d'Attente

Pour bypasser la file d'attente (utile pour les administrateurs) :

```bash
curl -H "X-Queue-Bypass: votre-token-secret" http://localhost:8000/api/products
```

## 🔄 Fonctionnement du Système

### 1. Première Visite
1. L'utilisateur accède au site Next.js
2. Un `session_id` unique est généré et stocké dans localStorage
3. Une requête est envoyée à `/api/queue/status`

### 2. Vérification de Capacité
1. Le middleware vérifie le nombre d'utilisateurs actifs
2. Si < `QUEUE_MAX_CONCURRENT_USERS` : accès immédiat
3. Si >= limite : ajout à la file d'attente

### 3. Salle d'Attente
1. Affichage de la position dans la file
2. Rafraîchissement automatique toutes les 5 secondes
3. Temps d'attente estimé affiché
4. Redirection automatique quand c'est le tour de l'utilisateur

### 4. Accès au Site
1. Session activée dans Redis (TTL de 5 minutes)
2. Heartbeat envoyé toutes les minutes
3. L'utilisateur peut naviguer normalement

### 5. Départ de l'Utilisateur
1. Événement `beforeunload` détecté
2. Session libérée via `sendBeacon`
3. Place libérée pour le prochain utilisateur

## 🧪 Tests

### Tester le Système de File d'Attente

#### 1. Réduire la limite pour tester
```env
QUEUE_MAX_CONCURRENT_USERS=2
```

#### 2. Simuler plusieurs utilisateurs

Ouvrez 3+ onglets de navigateur en mode incognito sur http://localhost:3000

- Les 2 premiers devraient voir les produits
- Le 3ème devrait voir la salle d'attente

#### 3. Vérifier les statistiques
```bash
curl http://localhost:8000/api/queue/stats
```

## 📊 Monitoring

### Redis CLI

```bash
# Se connecter à Redis
docker-compose exec redis redis-cli

# Voir les utilisateurs actifs
SMEMBERS queue:active_users

# Voir la file d'attente
ZRANGE queue:waiting 0 -1 WITHSCORES

# Voir une session spécifique
GET queue:session:xxx
```

### Logs

```bash
# Logs Laravel
docker-compose logs -f backend

# Logs Next.js
docker-compose logs -f frontend

# Logs Queue Worker
docker-compose logs -f queue_worker
```

## 🔧 Développement

### Sans Docker (Développement Local)

#### Backend
```bash
cd backend
composer install
php artisan key:generate
php artisan serve
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Assurez-vous d'avoir MySQL et Redis installés localement.

### Modifications en Temps Réel

Les volumes Docker sont configurés pour le hot-reload :
- Laravel : modifications détectées automatiquement
- Next.js : fast refresh activé

## 🔐 Sécurité

- **CORS configuré** pour accepter uniquement le frontend
- **Sessions sécurisées** avec TTL
- **Token de bypass** pour les administrateurs
- **Nettoyage automatique** des sessions expirées

## 📈 Optimisations Possibles

1. **Load Balancer** : Distribuer le trafic sur plusieurs instances
2. **CDN** : Pour les assets statiques du frontend
3. **Redis Cluster** : Pour la haute disponibilité
4. **Horizontal Scaling** : Plusieurs workers de queue
5. **Monitoring** : Intégration avec Prometheus/Grafana
6. **Rate Limiting** : Protection anti-DDoS supplémentaire

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend

Vérifiez la configuration CORS dans `backend/config/cors.php` et l'URL dans `frontend/.env.local`.

### Les sessions expirent trop vite

Augmentez le `SESSION_TTL` dans `QueueMiddleware.php` et `useQueue.ts`.

### Redis connection failed

Vérifiez que Redis est démarré :
```bash
docker-compose ps redis
docker-compose logs redis
```

## 📝 License

MIT

## 👥 Auteurs

Développé avec Laravel & Next.js

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
