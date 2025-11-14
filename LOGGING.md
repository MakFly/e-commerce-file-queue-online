# 📝 Logging System Documentation

This document describes the comprehensive logging system implemented across all application tiers.

---

## 🎯 Overview

The application uses a unified logging approach across:
- **Laravel Backend** (Port 8000)
- **Symfony Backend** (Port 8001)
- **Next.js Frontend** (Port 3000)
- **TanStack Start Frontend** (Port 3002)

All API requests and responses are logged with:
- Method and URL
- Status codes
- Response times (milliseconds)
- Request/response bodies (sanitized)
- Error details with stack traces

---

## 🔧 Backend Logging

### Laravel (Monolog)

**Configuration**: `backend-laravel/config/logging.php`

Channels:
- `api` - Dedicated API logging channel
- `single` - General application logs
- `daily` - Daily rotating logs

**Log Files**:
```
backend-laravel/storage/logs/
├── laravel.log      # General logs
└── api.log          # API requests/responses
```

**Implementation**:
- **Middleware**: `App\Http\Middleware\ApiLogger`
- **Attached to**: All API routes
- **Log Format**: JSON (structured)

**Example Log Entry**:
```json
{
  "message": "✅ API Response",
  "context": {
    "method": "GET",
    "url": "http://localhost:8000/api/products",
    "status": 200,
    "duration_ms": 45.23
  },
  "level": 200,
  "level_name": "INFO",
  "datetime": "2025-11-14T10:30:45.123456+00:00"
}
```

**Features**:
- ✅ Auto-sanitizes sensitive data (password, token, refresh_token)
- ✅ Emoji-based status indicators
- ✅ Error responses include response body
- ✅ Configurable log levels by environment

### Symfony (Monolog)

**Configuration**: `backend-symfony/config/packages/monolog.yaml`

Channels:
- `api` - Dedicated API logging
- `deprecation` - PHP deprecation warnings

**Log Files**:
```
backend-symfony/var/log/
├── dev.log          # Development logs
└── api.log          # API requests/responses
```

**Implementation**:
- **Event Listener**: `App\EventListener\ApiLoggerListener`
- **Events**: `kernel.request`, `kernel.response`, `kernel.exception`
- **Log Format**: JSON

**Example Log Entry**:
```json
{
  "message": "📥 API Request",
  "context": {
    "method": "POST",
    "url": "/api/auth/login",
    "ip": "172.20.0.1",
    "user_agent": "Mozilla/5.0...",
    "session_id": "abc123",
    "body": {
      "email": "user@example.com"
    }
  },
  "level": 200,
  "level_name": "INFO",
  "datetime": "2025-11-14T10:30:45.123456+00:00",
  "channel": "api"
}
```

**Features**:
- ✅ Request/Response/Exception logging
- ✅ Auto-sanitizes sensitive data
- ✅ Performance tracking (duration in ms)
- ✅ Separate channels for different log types
- ✅ Production-ready JSON formatting

---

## 🌐 Frontend Logging

### Technology: Pino

**Why Pino?**
- ⚡ Extremely fast (5x faster than alternatives)
- 🎨 Pretty formatting in development
- 📦 Lightweight (no dependencies)
- 🔧 Configurable transports
- 🌍 Works in browser and Node.js

### Next.js v16

**Configuration**: `frontend-nextjs-v16/src/lib/logger.ts`

**Loggers Available**:
```typescript
import {
  logger,        // Main logger
  apiLogger,     // API-specific
  queueLogger,   // Queue operations
  authLogger,    // Authentication
  devLog         // Development only
} from '@/lib/logger'
```

**Integration**: Automatic logging in `lib/helpers.ts`
- All API calls go through `fetchWithLogging()`
- Request/response automatically logged
- Errors include stack traces

**Usage Examples**:
```typescript
// API logging (automatic)
await api.getProducts() // ✅ Automatically logged

// Manual logging
queueLogger.info({ sessionId: '123', position: 5 }, 'User in queue')
authLogger.warn({ userId: 42 }, 'Token expired')

// Development only
devLog('Debug info', { data: someObject })
```

**Log Output (Development)**:
```
[10:30:45] INFO  (api): 📤 GET http://localhost:8000/api/products
[10:30:46] INFO  (api): ✅ GET http://localhost:8000/api/products - 200 (45ms)
```

**Production**:
- Logs can be sent to external services (Sentry, LogRocket, etc.)
- Configured in `logger.ts` transmit section

### TanStack Start

**Configuration**: `frontend-tanstack-start/app/lib/logger.ts`

**Loggers Available**:
```typescript
import {
  logger,        // Main logger
  apiLogger,     // API-specific
  queueLogger,   // Queue operations
  authLogger,    // Authentication
} from '@/lib/logger'
```

**Integration**: Built into `ApiClient` class
- All requests logged in `request()` method
- Automatic sanitization
- Performance tracking

**Same features as Next.js logger**

---

## 📊 Log Levels

### Backend (Laravel & Symfony)

| Status Code | Log Level | Emoji |
|-------------|-----------|-------|
| 200-299     | INFO      | ✅    |
| 300-399     | INFO      | 🔵    |
| 400-499     | WARNING   | 🟡    |
| 500-599     | ERROR     | 🔴    |

### Frontend (Pino)

| Level     | When to Use                          |
|-----------|--------------------------------------|
| `debug`   | Development debugging                |
| `info`    | Successful operations                |
| `warn`    | Recoverable errors, deprecations     |
| `error`   | Critical errors, exceptions          |

---

## 🔒 Security Features

### Automatic Data Sanitization

All loggers automatically remove sensitive fields:
- ❌ `password`
- ❌ `password_confirmation`
- ❌ `token`
- ❌ `refresh_token`

**Example**:
```typescript
// Input
{ email: 'user@example.com', password: 'secret123', token: 'abc...' }

// Logged (sanitized)
{ email: 'user@example.com' }
```

### What's Logged

**✅ Safe to Log**:
- Request method and URL
- HTTP status codes
- Response times
- Public user data (email, name)
- Session IDs
- User agents
- Error messages

**❌ Never Logged**:
- Passwords
- Authentication tokens
- Refresh tokens
- Credit card numbers
- API keys

---

## 🛠️ Configuration

### Laravel

**Environment Variables**:
```env
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

**Customize Log Path**:
Edit `config/logging.php`:
```php
'api' => [
    'driver' => 'daily',
    'path' => storage_path('logs/api.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'days' => 30,
],
```

### Symfony

**Environment-Specific**:
- Development: Console + File (pretty)
- Production: Stderr (JSON)

**Customize Channel**:
Edit `config/packages/monolog.yaml`:
```yaml
monolog:
    channels:
        - api
        - custom_channel

when@prod:
    monolog:
        handlers:
            api:
                type: stream
                path: "%kernel.logs_dir%/api.log"
                level: info
                formatter: monolog.formatter.json
```

### Frontend

**Production Logging Service Integration**:

Edit `logger.ts`:
```typescript
transmit: {
  level: 'info',
  send: (level, logEvent) => {
    // Send to Sentry
    if (level >= 40) { // error or fatal
      Sentry.captureException(new Error(logEvent.msg))
    }

    // Send to custom API
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEvent),
    }).catch(console.error)
  },
}
```

---

## 📈 Performance Impact

### Backend
- **Laravel**: ~2-5ms per request (negligible)
- **Symfony**: ~1-3ms per request (negligible)

### Frontend
- **Pino**: < 1ms per log entry
- **Zero impact** on user experience

---

## 🔍 Viewing Logs

### Development

**Laravel**:
```bash
# Tail API logs
tail -f backend-laravel/storage/logs/api.log

# With pretty formatting
tail -f backend-laravel/storage/logs/api.log | jq
```

**Symfony**:
```bash
# Tail API logs
tail -f backend-symfony/var/log/api.log

# Pretty format
tail -f backend-symfony/var/log/api.log | jq
```

**Frontend (Browser Console)**:
- Open DevTools (F12)
- Console tab shows all logs with colors

### Production

**Recommended Tools**:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **Datadog**
- **Sentry** (errors)
- **LogRocket** (session replay)

---

## 📝 Log Retention

### Backend
- **Development**: Keep indefinitely
- **Production**: 30 days (configurable)

### Frontend
- **Browser**: Until page reload
- **External Service**: Per service policy

---

## 🎨 Log Format Examples

### Successful Request
```
[2025-11-14 10:30:45] api.INFO: 📥 API Request {"method":"GET","url":"/api/products","ip":"127.0.0.1"}
[2025-11-14 10:30:46] api.INFO: ✅ API Response {"method":"GET","url":"/api/products","status":200,"duration_ms":45.23}
```

### Error Request
```
[2025-11-14 10:30:45] api.INFO: 📥 API Request {"method":"POST","url":"/api/orders","body":{"product_id":1,"quantity":5}}
[2025-11-14 10:30:46] api.WARNING: 🟡 API Response {"method":"POST","url":"/api/orders","status":400,"duration_ms":23.12,"response":{"message":"Insufficient stock"}}
```

### Exception
```
[2025-11-14 10:30:45] api.ERROR: 🔴 API Exception {"method":"GET","url":"/api/admin/stats","duration_ms":12.34,"exception":"Symfony\\Component\\Security\\Core\\Exception\\AccessDeniedException","message":"Access Denied.","file":"/app/src/Controller/AdminController.php","line":42}
```

---

## 🚀 Best Practices

1. **Use Appropriate Log Levels**
   - `debug`: Temporary debugging (remove before commit)
   - `info`: Normal operation
   - `warn`: Recoverable issues
   - `error`: Critical failures

2. **Add Context**
   ```typescript
   // ❌ Bad
   logger.error('Failed')

   // ✅ Good
   logger.error({ userId: 42, orderId: 123 }, 'Order creation failed')
   ```

3. **Don't Log in Loops**
   ```typescript
   // ❌ Bad
   products.forEach(p => logger.info('Processing', p))

   // ✅ Good
   logger.info({ count: products.length }, 'Processing products')
   ```

4. **Use Structured Logging**
   ```typescript
   // ❌ Bad
   logger.info(`User ${userId} placed order ${orderId}`)

   // ✅ Good
   logger.info({ userId, orderId }, 'User placed order')
   ```

---

## 🔧 Troubleshooting

### Logs Not Appearing (Laravel)

1. Check permissions:
   ```bash
   chmod -R 775 backend-laravel/storage/logs
   chown -R www-data:www-data backend-laravel/storage/logs
   ```

2. Verify log channel:
   ```php
   // In .env
   LOG_CHANNEL=stack
   ```

3. Clear cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### Logs Not Appearing (Symfony)

1. Check permissions:
   ```bash
   chmod -R 775 backend-symfony/var/log
   ```

2. Verify service injection:
   ```yaml
   # config/services.yaml
   App\EventListener\ApiLoggerListener:
       arguments:
           $apiLogger: '@monolog.logger.api'
   ```

3. Clear cache:
   ```bash
   php bin/console cache:clear
   ```

### Frontend Logs Not Showing

1. Check browser console
2. Verify log level:
   ```typescript
   logger.level = 'debug' // Show all logs
   ```

3. Check NODE_ENV:
   ```bash
   echo $NODE_ENV # Should be 'development' for verbose logs
   ```

---

## 📚 References

- [Pino Documentation](https://getpino.io/)
- [Monolog Documentation](https://github.com/Seldaek/monolog)
- [Laravel Logging](https://laravel.com/docs/logging)
- [Symfony Logging](https://symfony.com/doc/current/logging.html)

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0
