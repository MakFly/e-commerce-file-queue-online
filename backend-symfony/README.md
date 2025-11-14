# Symfony E-Commerce Backend

Backend API built with Symfony 7 + API Platform 3.

## 📦 Stack

- **Symfony** 7.0
- **API Platform** 3.2
- **Doctrine ORM** 2.17
- **Lexik JWT** 2.20
- **Predis** 2.2 for Redis
- **Nelmio CORS** 2.4

## 🚀 Installation

### 1. Install dependencies

```bash
docker-compose run --rm backend-symfony composer install
```

### 2. Generate JWT keys

```bash
# Create JWT directory
mkdir -p config/jwt

# Generate private key
openssl genpkey -out config/jwt/private.pem \
  -aes256 \
  -algorithm rsa \
  -pkeyopt rsa_keygen_bits:4096 \
  -pass pass:ecommerce_jwt_passphrase

# Generate public key
openssl pkey -in config/jwt/private.pem \
  -passin pass:ecommerce_jwt_passphrase \
  -out config/jwt/public.pem \
  -pubout

# Set permissions
chmod 644 config/jwt/*.pem
```

### 3. Create database

```bash
docker-compose exec backend-symfony php bin/console doctrine:database:create --if-not-exists
```

### 4. Run migrations

```bash
docker-compose exec backend-symfony php bin/console doctrine:migrations:migrate -n
```

### 5. Load fixtures (optional)

```bash
docker-compose exec backend-symfony php bin/console doctrine:fixtures:load -n
```

## 🔧 Development

### Start server

```bash
docker-compose up -d backend-symfony
```

### Access API

- **Base URL**: http://localhost:8001
- **API Documentation**: http://localhost:8001/api/docs
- **OpenAPI JSON**: http://localhost:8001/api/docs.json

### Useful commands

```bash
# Cache
php bin/console cache:clear

# Database
php bin/console doctrine:schema:update --force
php bin/console doctrine:migrations:diff

# Debug
php bin/console debug:router
php bin/console debug:container
```

## 📡 API Endpoints

All endpoints are identical to the Laravel backend (Port 8000).

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Queue
- `GET /api/queue/status`
- `POST /api/queue/heartbeat`
- `POST /api/queue/release`
- `GET /api/queue/stats`

### Products
- `GET /api/products`
- `GET /api/products/{id}`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/stats`
- `POST /api/admin/kick-user`
- `POST /api/admin/clear-queue`
- `POST /api/admin/update-config`

## 📚 Documentation

See `SYMFONY_SETUP.md` for complete documentation.
