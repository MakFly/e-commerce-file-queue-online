# JWT Refresh Token Guide - Gesdinet Bundle

## 📋 Overview

This Symfony backend implements JWT refresh tokens using **Gesdinet JWT Refresh Token Bundle v1.5.0**, the industry-standard solution for refresh token management with Lexik JWT Authentication.

## 🔑 What is a Refresh Token?

- **Access Token (JWT)**: Short-lived token (1 hour) used for API authentication
- **Refresh Token**: Long-lived token (30 days) used to obtain new access tokens without re-authentication

## 📦 Installation

Already installed via Composer:

```bash
composer require gesdinet/jwt-refresh-token-bundle
```

## ⚙️ Configuration

### 1. Bundle Registration

**config/bundles.php**:
```php
Gesdinet\JWTRefreshTokenBundle\GesdinetJWTRefreshTokenBundle::class => ['all' => true],
```

### 2. Refresh Token Configuration

**config/packages/gesdinet_jwt_refresh_token.yaml**:
```yaml
gesdinet_jwt_refresh_token:
    ttl: 2592000                    # 30 days
    ttl_update: true                # Update TTL on usage
    firewall: api
    user_provider: security.user.provider.concrete.app_user_provider
    user_identity_field: email
    token_parameter_name: refresh_token
    single_use: false               # Allow multiple uses
    refresh_token_class: App\Entity\RefreshToken
    return_expiration: true
```

### 3. Security Configuration

**config/packages/security.yaml**:
```yaml
firewalls:
    refresh:
        pattern: ^/api/auth/token/refresh
        stateless: true

access_control:
    - { path: ^/api/auth/token/refresh, roles: PUBLIC_ACCESS }
```

### 4. Routing

**config/routes.yaml**:
```yaml
gesdinet_jwt_refresh_token:
    path: /api/auth/token/refresh
    controller: gesdinet.jwtrefreshtoken::refresh
```

## 🗄️ Database Schema

**refresh_tokens table**:
```sql
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT NOT NULL,
    refresh_token VARCHAR(128) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    valid DATETIME NOT NULL,
    PRIMARY KEY(id)
);
```

**Run migration**:
```bash
php bin/console doctrine:migrations:migrate
```

## 🔄 API Endpoints

### 1. Register (Returns Access + Refresh Token)

**POST** `/api/auth/register`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "a1b2c3d4e5f6...",
  "refresh_token_expiration": 1704067200
}
```

### 2. Login (Returns Access + Refresh Token)

**POST** `/api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "a1b2c3d4e5f6...",
  "refresh_token_expiration": 1704067200
}
```

> **Note**: The `refresh_token` is automatically added to the login response by the `JWTCreatedListener`.

### 3. Refresh Access Token

**POST** `/api/auth/token/refresh`

**Request**:
```json
{
  "refresh_token": "a1b2c3d4e5f6..."
}
```

**Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "a1b2c3d4e5f6...",
  "refresh_token_expiration": 1704067200
}
```

> **Important**: With `ttl_update: true`, the refresh token's expiration is renewed on each use.

### 4. Logout (Revoke Refresh Token)

**POST** `/api/auth/logout`

**Request**:
```json
{
  "refresh_token": "a1b2c3d4e5f6..."
}
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

## 🏗️ Implementation Details

### Entity: RefreshToken

**src/Entity/RefreshToken.php**:
```php
#[ORM\Entity]
#[ORM\Table(name: 'refresh_tokens')]
class RefreshToken extends BaseRefreshToken
{
    // Extends Gesdinet's base entity
}
```

### Event Listener: JWTCreatedListener

**src/EventListener/JWTCreatedListener.php**:
- Listens to `lexik_jwt_authentication.on_authentication_success`
- Automatically generates and attaches refresh token to login response
- Saves refresh token to database

**Registered in services.yaml**:
```yaml
App\EventListener\JWTCreatedListener:
    arguments:
        $ttl: 2592000  # 30 days
    tags:
        - { name: kernel.event_listener, event: lexik_jwt_authentication.on_authentication_success }
```

### Controller: AuthController

**src/Controller/AuthController.php**:
- **register()**: Creates user, generates access + refresh token
- **logout()**: Revokes refresh token from database
- **refresh()**: Handled by Gesdinet bundle (route: `/api/auth/token/refresh`)

## 🔐 Security Features

### 1. Automatic Token Expiration
- Refresh tokens automatically expire after 30 days
- Expired tokens are rejected by Gesdinet

### 2. Token Revocation
- Tokens deleted from database on logout
- Invalid tokens cannot be used

### 3. TTL Update on Usage
- With `ttl_update: true`, refresh token validity extends on each use
- Prevents token expiration for active users

### 4. Single Use Option
- Set `single_use: true` for one-time use refresh tokens
- Token is deleted and new one generated after each refresh

## 🧪 Testing with cURL

### 1. Register
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

### 2. Use Access Token
```bash
curl -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Refresh Access Token
```bash
curl -X POST http://localhost:8001/api/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### 4. Logout
```bash
curl -X POST http://localhost:8001/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## 📊 Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOGIN/REGISTER                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │   Generate Access Token (1h)      │
         │   Generate Refresh Token (30d)    │
         │   Save Refresh Token to DB        │
         └───────────────┬───────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │   Return Both Tokens to Client    │
         └───────────────┬───────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌────────────────┐              ┌──────────────────┐
│ Access Token   │              │ Refresh Token    │
│ Used for API   │              │ Stored Securely  │
│ Requests       │              │ (e.g., HttpOnly) │
└────────┬───────┘              └────────┬─────────┘
         │                               │
         │ Expires after 1 hour          │
         │                               │
         ▼                               │
┌────────────────┐                       │
│ Token Expired  │                       │
│ API Returns    │                       │
│ 401 Error      │                       │
└────────┬───────┘                       │
         │                               │
         │  Client detects 401           │
         └───────────────┐               │
                         │               │
                         ▼               ▼
         ┌──────────────────────────────────┐
         │  POST /api/auth/token/refresh    │
         │  with refresh_token              │
         └────────────────┬─────────────────┘
                          │
                          ▼
         ┌──────────────────────────────────┐
         │  Validate Refresh Token:         │
         │  - Exists in DB?                 │
         │  - Not expired?                  │
         │  - User still exists?            │
         └────────────────┬─────────────────┘
                          │
         ┌────────────────┴─────────────────┐
         │ Valid                    Invalid │
         ▼                                  ▼
┌────────────────┐              ┌──────────────────┐
│ Generate New   │              │ Return 401       │
│ Access Token   │              │ User Must Login  │
│ Return to      │              │ Again            │
│ Client         │              └──────────────────┘
└────────────────┘
```

## 🎯 Best Practices

### 1. Frontend Storage
- **Access Token**: Memory (state) or sessionStorage
- **Refresh Token**: HttpOnly cookie or secure storage
- **Never** store refresh tokens in localStorage

### 2. Token Rotation
- Enable `single_use: true` for maximum security
- Each refresh generates a new refresh token
- Old token is invalidated

### 3. Error Handling
```javascript
async function apiRequest(url, options) {
  let response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers
    }
  });

  // If 401, try to refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${newAccessToken}`,
          ...options.headers
        }
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```

### 4. Cleanup Old Tokens
```bash
# Add to cron (daily at 2am)
0 2 * * * php /path/to/symfony/bin/console gesdinet:jwt:clear
```

## 📚 Resources

- [Gesdinet Bundle GitHub](https://github.com/markitosgv/JWTRefreshTokenBundle)
- [Lexik JWT Authentication](https://github.com/lexik/LexikJWTAuthenticationBundle)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## ✅ Implementation Checklist

- [x] Install Gesdinet JWT Refresh Token Bundle v1.5.0
- [x] Configure bundle in `gesdinet_jwt_refresh_token.yaml`
- [x] Register bundle in `config/bundles.php`
- [x] Create `RefreshToken` entity extending `BaseRefreshToken`
- [x] Create `refresh_tokens` table migration
- [x] Add refresh token route in `routes.yaml`
- [x] Configure security firewall for refresh endpoint
- [x] Create `JWTCreatedListener` for automatic token attachment
- [x] Update `AuthController` for register and logout
- [x] Test all endpoints (register, login, refresh, logout)

## 🚀 Production Deployment

1. **Run migrations**:
   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction
   ```

2. **Set up token cleanup cron**:
   ```bash
   # /etc/cron.d/symfony-jwt-cleanup
   0 2 * * * www-data php /var/www/symfony/bin/console gesdinet:jwt:clear >> /var/log/jwt-cleanup.log 2>&1
   ```

3. **Configure environment variables**:
   ```env
   JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
   JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
   JWT_PASSPHRASE=your-strong-passphrase
   ```

4. **Enable HTTPS** for production to protect tokens in transit

---

**Version**: 1.0.0
**Bundle**: Gesdinet JWT Refresh Token Bundle v1.5.0
**Symfony**: 7.0
**Last Updated**: 2025-11-14
