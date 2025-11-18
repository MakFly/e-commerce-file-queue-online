# 🚀 Installation du Système de Logging

Ce guide explique comment installer et activer le système de logging complet.

---

## 📋 Prérequis

- PHP 8.2+
- Composer
- Node.js 18+
- npm ou yarn

---

## 🔧 Backend Symfony

### 1. Installer les dépendances

```bash
cd backend-symfony
composer install
```

Cela installera automatiquement :
- `symfony/monolog-bundle` (^3.10) - déjà ajouté dans composer.json

### 2. Vérifier la configuration

Les fichiers suivants doivent exister :
- ✅ `config/packages/monolog.yaml` - Configuration Monolog
- ✅ `config/bundles.php` - MonologBundle enregistré
- ✅ `src/EventListener/ApiLoggerListener.php` - Event listener
- ✅ `config/services.yaml` - Service configuré

### 3. Tester

```bash
# Lancer le serveur
symfony server:start

# Dans un autre terminal, tester une requête
curl http://localhost:8001/api/products

# Voir les logs
tail -f var/log/api.log
```

**Log attendu** :
```json
{
  "message": "📥 API Request",
  "context": {
    "method": "GET",
    "url": "/api/products"
  }
}
```

---

## 🔧 Backend Laravel

### 1. Installer les dépendances

```bash
cd backend-laravel
composer install
```

Monolog est déjà inclus dans `laravel/framework`.

### 2. Vérifier la configuration

Les fichiers suivants doivent exister :
- ✅ `config/logging.php` - Configuration Monolog
- ✅ `app/Http/Middleware/ApiLogger.php` - Middleware
- ✅ `bootstrap/app.php` - Middleware enregistré

### 3. Créer le dossier de logs

```bash
mkdir -p storage/logs
chmod 775 storage/logs
```

### 4. Tester

```bash
# Lancer le serveur
php artisan serve

# Dans un autre terminal, tester une requête
curl http://localhost:8000/api/products

# Voir les logs
tail -f storage/logs/api.log
```

---

## 🌐 Frontend Next.js v16

### 1. Installer les dépendances

```bash
cd frontend-nextjs-v16
npm install
```

Cela installera automatiquement :
- `pino@9.5.0` - Logger haute performance
- `pino-pretty@13.0.0` - Formatage développement

**Déjà ajouté dans package.json** ✅

### 2. Vérifier les fichiers

- ✅ `src/lib/logger.ts` - Configuration Pino
- ✅ `src/lib/helpers.ts` - Helpers avec logging
- ✅ `src/lib/api.ts` - Intégration dans API client

### 3. Tester

```bash
# Lancer en mode dev
npm run dev

# Ouvrir le navigateur sur http://localhost:3000
# Ouvrir la console DevTools (F12)
# Naviguer sur le site pour voir les logs
```

**Logs attendus dans la console** :
```
[10:30:45] INFO  (api): 📤 GET http://localhost:8000/api/products
[10:30:46] INFO  (api): ✅ GET http://localhost:8000/api/products - 200 (45ms)
```

---

## 🌐 Frontend TanStack Start

### 1. Installer les dépendances

```bash
cd frontend-tanstack-start
npm install
```

Cela installera automatiquement :
- `pino@9.5.0`
- `pino-pretty@13.0.0`

**Déjà ajouté dans package.json** ✅

### 2. Vérifier les fichiers

- ✅ `app/lib/logger.ts` - Configuration Pino
- ✅ `app/lib/api.ts` - Intégration dans ApiClient

### 3. Tester

```bash
# Lancer en mode dev
npm run dev

# Ouvrir le navigateur sur http://localhost:3002
# Ouvrir la console DevTools (F12)
# Naviguer sur le site pour voir les logs
```

---

## ✅ Vérification Complète

### Checklist d'installation

#### Backend Symfony
- [ ] `composer install` exécuté
- [ ] `var/log/` existe et est writable
- [ ] Logs visibles dans `var/log/api.log`
- [ ] Requêtes API logguées avec emoji ✅

#### Backend Laravel
- [ ] `composer install` exécuté
- [ ] `storage/logs/` existe et est writable
- [ ] Logs visibles dans `storage/logs/api.log`
- [ ] Requêtes API logguées avec emoji ✅

#### Frontend Next.js
- [ ] `npm install` exécuté
- [ ] `node_modules/pino/` existe
- [ ] Logs visibles dans console navigateur
- [ ] Formatage coloré en développement

#### Frontend TanStack Start
- [ ] `npm install` exécuté
- [ ] `node_modules/pino/` existe
- [ ] Logs visibles dans console navigateur
- [ ] Formatage coloré en développement

---

## 🐛 Troubleshooting

### Symfony : "Service not found: '@monolog.logger.api'"

**Problème** : MonologBundle pas installé

**Solution** :
```bash
composer require symfony/monolog-bundle
php bin/console cache:clear
```

### Laravel : "Unable to create log file: Permission denied"

**Problème** : Permissions incorrectes

**Solution** :
```bash
chmod -R 775 storage/logs
chown -R www-data:www-data storage/logs
```

### Frontend : "Cannot find module 'pino'"

**Problème** : Dépendances pas installées

**Solution** :
```bash
rm -rf node_modules package-lock.json
npm install
```

### Logs n'apparaissent pas

**Vérifier** :
1. Niveau de log approprié (debug en dev, info en prod)
2. Fichier de config correct
3. Permissions des dossiers
4. Cache vidé

---

## 📊 Commandes Utiles

### Voir les logs en temps réel

**Symfony** :
```bash
tail -f backend-symfony/var/log/api.log | jq
```

**Laravel** :
```bash
tail -f backend-laravel/storage/logs/api.log | jq
```

### Nettoyer les logs

**Symfony** :
```bash
rm backend-symfony/var/log/*.log
```

**Laravel** :
```bash
rm backend-laravel/storage/logs/*.log
```

### Vérifier la taille des logs

```bash
du -sh backend-*/var/log/*.log backend-*/storage/logs/*.log
```

---

## 🚀 Prêt pour la Production

Avant de déployer :

1. **Backends** :
   - [ ] Définir `LOG_LEVEL=info` en production
   - [ ] Configurer rotation des logs (logrotate)
   - [ ] Vérifier permissions des dossiers

2. **Frontends** :
   - [ ] Configurer envoi vers service externe (Sentry)
   - [ ] Définir `NODE_ENV=production`
   - [ ] Tester en mode production

3. **Général** :
   - [ ] Tester le système de logging
   - [ ] Vérifier les performances
   - [ ] Documenter pour l'équipe

---

**Dernière mise à jour** : 2025-11-14
