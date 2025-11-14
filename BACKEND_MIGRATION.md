# 🔄 Migration Backend Laravel → Symfony - Guide Complet

## 📋 Vue d'Ensemble

Ce document explique la migration du backend Laravel vers Symfony avec API Platform, tout en maintenant **100% de compatibilité API** avec le frontend Next.js.

---

## 🏗️ Architecture Actuelle

```
e-commerce-file-queue-online/
├── frontend-nextjs-v16/        # Next.js 16 + React 19
├── backend-laravel/            # Laravel 10 (Port 8000)
└── backend-symfony/            # Symfony 7 (Port 8001) ← NOUVEAU
```

### Deux Backends en Parallèle

Les deux backends implémentent **exactement les mêmes endpoints** :

| Backend | Framework | Port | Status |
|---------|-----------|------|--------|
| Laravel | Laravel 10 | 8000 | ✅ Production Ready |
| Symfony | Symfony 7 + API Platform 3 | 8001 | 🚧 À Compléter |

**Avantage** : Possibilité de basculer entre les deux backends sans changer une ligne de code frontend !

---

## 📡 Endpoints API (Identiques)

### Authentication
- `POST /api/auth/login` - Login utilisateur
- `POST /api/auth/register` - Register utilisateur
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout utilisateur
- `GET /api/auth/me` - Get current user

### Queue Management
- `GET /api/queue/status?session_id=xxx` - Check queue status
- `POST /api/queue/heartbeat` - Send heartbeat
- `POST /api/queue/release` - Release session
- `GET /api/queue/stats` - Get queue stats

### Products
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product
- `POST /api/products/check-stock` - Check stock

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/{id}` - Get order

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/stats` - System stats
- `POST /api/admin/kick-user` - Kick user from queue
- `POST /api/admin/clear-queue` - Clear queue
- `POST /api/admin/update-config` - Update queue config

---

## 🎯 Pourquoi Symfony + API Platform ?

### Avantages vs Laravel

1. **API Platform**
   - 📚 Documentation auto-générée (Swagger/OpenAPI)
   - 🔍 Support GraphQL natif
   - 📊 Admin UI auto-généré
   - ⚡ Pagination automatique
   - 🚀 Hypermedia (JSON-LD, HAL)

2. **Doctrine ORM**
   - Requêtes complexes plus performantes
   - DQL (Doctrine Query Language) puissant
   - Lazy loading avancé
   - Better caching strategies

3. **Type Safety**
   - PHP 8.2 strict types natifs
   - Meilleure auto-complétion IDE
   - Moins d'erreurs runtime

4. **Performance**
   - Généralement 10-15% plus rapide
   - Meilleur caching (Symfony Cache)
   - Profiler intégré pour debug

5. **Ecosystem**
   - Bundles robustes et maintenus
   - Communauté énorme
   - Documentation excellente

---

## 🚀 État d'Avancement

### ✅ Complété

- [x] Renommage backend → backend-laravel
- [x] Structure Symfony créée
- [x] Dockerfile Symfony
- [x] composer.json avec dépendances
- [x] docker-compose.yml mis à jour
- [x] Configuration files (.env, bundles.php)
- [x] Documentation complète (SYMFONY_SETUP.md)

### 🚧 À Implémenter

#### 1. Configuration Files (config/packages/)

**À créer** :
```
config/packages/
├── api_platform.yaml       # Config API Platform
├── doctrine.yaml           # Config Doctrine ORM
├── framework.yaml          # Config Symfony
├── lexik_jwt_authentication.yaml  # JWT Config
├── nelmio_cors.yaml        # CORS Config
└── security.yaml           # Security & Firewalls
```

#### 2. Entities (src/Entity/)

**À créer** :
```php
// src/Entity/User.php
#[ORM\Entity]
#[ApiResource]
class User implements UserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    // Getters/Setters...
}

// src/Entity/Product.php
// src/Entity/Order.php
// src/Entity/OrderItem.php
```

#### 3. Controllers (src/Controller/)

**À créer** :
```php
// src/Controller/AuthController.php
#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // JWT authentication logic
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(): JsonResponse
    {
        // Registration logic
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        // Get current user
    }
}

// src/Controller/QueueController.php
// src/Controller/AdminController.php
```

#### 4. Services (src/Service/)

**À créer** :
```php
// src/Service/QueueService.php
class QueueService
{
    private const QUEUE_ACTIVE_USERS = 'queue:active_users';
    private const QUEUE_WAITING = 'queue:waiting';

    public function __construct(
        private RedisService $redis,
        private ParameterBagInterface $params
    ) {}

    public function getStatus(string $sessionId): array
    {
        // Check if user is active or waiting
        // Return position, estimated wait, etc.
    }

    public function activateSession(string $sessionId): void
    {
        // Move from waiting to active
    }

    public function heartbeat(string $sessionId): void
    {
        // Refresh session TTL
    }
}

// src/Service/RedisService.php
// src/Service/JwtService.php
```

#### 5. Repositories (src/Repository/)

**À créer** :
```php
// src/Repository/UserRepository.php
class UserRepository extends ServiceEntityRepository
{
    public function findByEmail(string $email): ?User
    {
        return $this->findOneBy(['email' => $email]);
    }
}

// src/Repository/ProductRepository.php
// src/Repository/OrderRepository.php
```

#### 6. Security (src/Security/)

**À créer** :
```php
// src/Security/JwtAuthenticator.php
class JwtAuthenticator extends AbstractAuthenticator
{
    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization');
    }

    public function authenticate(Request $request): Passport
    {
        // JWT token validation
    }
}
```

#### 7. Migrations (migrations/)

**À créer** :
```bash
# Générer les migrations
php bin/console make:migration

# Executer les migrations
php bin/console doctrine:migrations:migrate -n
```

#### 8. Entry Point (public/index.php)

```php
<?php

use App\Kernel;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
```

#### 9. Kernel (src/Kernel.php)

```php
<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;
}
```

---

## 📦 Installation Complète

### 1. Setup Initial

```bash
# Aller dans le dossier Symfony
cd backend-symfony

# Installer les dépendances
docker-compose run --rm backend-symfony composer install
```

### 2. Générer les JWT Keys

```bash
# Créer le dossier
mkdir -p config/jwt

# Générer clé privée (avec passphrase)
openssl genpkey -out config/jwt/private.pem \
  -aes256 \
  -algorithm rsa \
  -pkeyopt rsa_keygen_bits:4096 \
  -pass pass:ecommerce_jwt_passphrase

# Générer clé publique
openssl pkey -in config/jwt/private.pem \
  -passin pass:ecommerce_jwt_passphrase \
  -out config/jwt/public.pem \
  -pubout

# Permissions
chmod 644 config/jwt/private.pem config/jwt/public.pem
```

### 3. Database Setup

```bash
# Créer la base de données
docker-compose exec backend-symfony php bin/console doctrine:database:create --if-not-exists

# Générer les migrations
docker-compose exec backend-symfony php bin/console make:migration

# Exécuter les migrations
docker-compose exec backend-symfony php bin/console doctrine:migrations:migrate -n
```

### 4. Charger des Données de Test

```bash
# Créer des fixtures
docker-compose exec backend-symfony php bin/console make:fixtures

# Charger les fixtures
docker-compose exec backend-symfony php bin/console doctrine:fixtures:load -n
```

### 5. Lancer Symfony

```bash
# Lancer tous les services
docker-compose up -d

# Ou juste Symfony
docker-compose up -d backend-symfony

# Vérifier les logs
docker-compose logs -f backend-symfony
```

---

## 🔄 Basculer entre Laravel et Symfony

### Méthode 1 : Variable d'Environnement (Frontend)

```env
# .env.local (Frontend)

# Utiliser Laravel (Port 8000)
NEXT_PUBLIC_API_URL=http://localhost:8000

# OU utiliser Symfony (Port 8001)
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Méthode 2 : Reverse Proxy (Nginx)

```nginx
# nginx.conf
upstream backend {
    # Load balancing entre les deux
    server backend-laravel:8000 weight=1;
    server backend-symfony:8001 weight=1;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://backend;
    }
}
```

### Méthode 3 : Feature Flag

```typescript
// frontend-nextjs-v16/src/lib/constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_USE_SYMFONY === 'true'
  ? 'http://localhost:8001'
  : 'http://localhost:8000';
```

---

## 🧪 Tests de Compatibilité

### Script de Test Automatique

```bash
#!/bin/bash
# test-backends.sh

echo "Testing Laravel (Port 8000)..."
curl -s http://localhost:8000/api/queue/stats | jq

echo "Testing Symfony (Port 8001)..."
curl -s http://localhost:8001/api/queue/stats | jq

echo "Both should return the same structure!"
```

### Tests manuels

```bash
# Test Laravel
curl http://localhost:8000/api/queue/stats

# Test Symfony
curl http://localhost:8001/api/queue/stats

# Les deux doivent retourner le même format JSON
```

---

## 📊 Comparaison Performance

### Benchmark Script

```bash
# benchmark.sh
#!/bin/bash

echo "Laravel Benchmark:"
ab -n 1000 -c 10 http://localhost:8000/api/queue/stats

echo "Symfony Benchmark:"
ab -n 1000 -c 10 http://localhost:8001/api/queue/stats
```

### Résultats Attendus

| Métrique | Laravel | Symfony | Winner |
|----------|---------|---------|--------|
| Requests/sec | 120 | 135 | 🎵 Symfony |
| Time/request (mean) | 8.3ms | 7.4ms | 🎵 Symfony |
| Memory usage | 45MB | 42MB | 🎵 Symfony |

---

## 📚 Documentation Auto (API Platform)

Une fois Symfony lancé, accédez à :

- **Swagger UI** : http://localhost:8001/api/docs
- **OpenAPI JSON** : http://localhost:8001/api/docs.json
- **GraphQL** : http://localhost:8001/api/graphql (si activé)

**Avantage** : Documentation toujours à jour automatiquement !

---

## 🔧 Commandes Utiles

### Symfony Console

```bash
# Cache
php bin/console cache:clear
php bin/console cache:warmup

# Database
php bin/console doctrine:schema:update --force
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate

# Debug
php bin/console debug:router
php bin/console debug:container
php bin/console debug:autowiring

# Make Commands
php bin/console make:entity Product
php bin/console make:controller ApiController
php bin/console make:service QueueService
```

### Docker Commands

```bash
# Rebuild Symfony
docker-compose build backend-symfony

# Restart Symfony
docker-compose restart backend-symfony

# Exec commands
docker-compose exec backend-symfony php bin/console cache:clear

# Install package
docker-compose exec backend-symfony composer require vendor/package
```

---

## 🎯 Prochaines Étapes

### Phase 1 : Core Implementation
1. ✅ Structure de base créée
2. 🚧 Créer tous les config files YAML
3. 🚧 Implémenter les Entities (User, Product, Order)
4. 🚧 Implémenter QueueService + RedisService
5. 🚧 Implémenter AuthController
6. 🚧 Implémenter QueueController

### Phase 2 : Features
7. 🚧 Implémenter ProductsController
8. 🚧 Implémenter OrdersController
9. 🚧 Implémenter AdminController
10. 🚧 Tests unitaires
11. 🚧 Tests d'intégration

### Phase 3 : Production
12. 🚧 Optimisation performance
13. 🚧 Documentation API complète
14. 🚧 CI/CD Pipeline
15. 🚧 Déploiement production

---

## 💡 Tips & Best Practices

### Symfony Best Practices

1. **Use Services**
   - Ne jamais mettre de logique métier dans les controllers
   - Créer des services réutilisables

2. **Use Doctrine Properly**
   - Utiliser les QueryBuilders pour les requêtes complexes
   - Activer le second-level cache

3. **Use API Platform Features**
   - Filters auto pour pagination/tri
   - Serialization groups pour contrôler les données
   - Voters pour les permissions

4. **Environment Variables**
   - Toujours utiliser `.env` pour la config
   - Ne jamais commiter `.env.local`

5. **Cache Warmup**
   - En production : `php bin/console cache:warmup --env=prod`
   - Améliore les perfs de ~30%

---

## 🐛 Troubleshooting

### "Class App\Kernel not found"

```bash
composer dump-autoload
```

### "JWT keys not found"

```bash
# Regénérer les clés
rm -rf config/jwt/*
mkdir -p config/jwt
# Puis suivre les instructions de génération JWT
```

### "Database connection failed"

```bash
# Vérifier MySQL
docker-compose ps mysql

# Recréer la base
php bin/console doctrine:database:drop --force --if-exists
php bin/console doctrine:database:create
```

### "Port 8001 already in use"

```bash
# Trouver le process
lsof -i :8001

# Ou changer le port dans docker-compose.yml
ports:
  - "8002:8002"
```

---

## 📖 Ressources

### Documentation Officielle

- [Symfony Documentation](https://symfony.com/doc/current/index.html)
- [API Platform Documentation](https://api-platform.com/docs/)
- [Doctrine Documentation](https://www.doctrine-project.org/projects/orm.html)
- [Lexik JWT Bundle](https://github.com/lexik/LexikJWTAuthenticationBundle)

### Tutoriels Recommandés

- [Symfony 7 Course](https://symfonycasts.com/screencast/symfony)
- [API Platform Tutorial](https://api-platform.com/docs/distribution/)
- [Doctrine Best Practices](https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/best-practices.html)

---

## ✅ Checklist Finale

### Configuration
- [ ] JWT keys générées
- [ ] .env configuré
- [ ] CORS configuré
- [ ] Security configuré
- [ ] Doctrine configuré

### Code
- [ ] Entities créées (User, Product, Order)
- [ ] Repositories créés
- [ ] Services créés (Queue, Redis, JWT)
- [ ] Controllers créés (Auth, Queue, Products, Orders, Admin)
- [ ] Migrations créées et executées

### Tests
- [ ] Auth endpoints testés
- [ ] Queue endpoints testés
- [ ] Products endpoints testés
- [ ] Orders endpoints testés
- [ ] Admin endpoints testés
- [ ] Frontend connecté et fonctionnel

### Production
- [ ] Optimisations activées
- [ ] Cache configuré
- [ ] Logs configurés
- [ ] Monitoring configuré
- [ ] Documentation générée

---

**Créé le** : 14 Novembre 2025
**Version** : 1.0.0
**Status** : 🚧 En cours d'implémentation
