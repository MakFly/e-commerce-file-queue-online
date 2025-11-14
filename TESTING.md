# Guide de Test - Système de File d'Attente

## 🧪 Comment Tester la File d'Attente Rapidement

### Étape 1 : Réduire la Limite d'Utilisateurs

Pour simuler une surcharge à 200%, configurez la limite à **1 utilisateur** seulement :

**Dans `backend/.env` :**
```env
QUEUE_MAX_CONCURRENT_USERS=1
```

Ainsi :
- Le 1er utilisateur → Accès direct au site ✅
- Le 2ème utilisateur → File d'attente 🕒

### Étape 2 : Démarrer l'Application

```bash
# Depuis la racine du projet
docker-compose up -d

# Attendre que tous les services soient prêts (30 secondes environ)
docker-compose ps

# Vérifier les logs si nécessaire
docker-compose logs -f backend
```

### Étape 3 : Créer le Fichier .env pour le Backend

```bash
# Copier le fichier d'exemple
cp backend/.env.example backend/.env

# Éditer pour mettre QUEUE_MAX_CONCURRENT_USERS=1
```

### Étape 4 : Tester avec Plusieurs Navigateurs

#### Option A : Onglets Incognito (Recommandé)

1. **Navigateur Normal** : Ouvrez http://localhost:3000
   - ✅ Vous devriez voir les produits (utilisateur actif)

2. **Fenêtre Incognito** : Ouvrez http://localhost:3000
   - 🕒 Vous devriez voir la salle d'attente !

#### Option B : Différents Navigateurs

1. **Chrome** : http://localhost:3000 → Produits
2. **Firefox** : http://localhost:3000 → File d'attente

#### Option C : Navigation Privée

1. **Safari Normal** : http://localhost:3000 → Produits
2. **Safari Privé** : http://localhost:3000 → File d'attente

### Étape 5 : Observer la File en Action

1. Gardez les deux fenêtres ouvertes côte à côte
2. Dans la fenêtre en file d'attente :
   - Position : 1
   - Temps estimé : 30 secondes
   - Rafraîchissement automatique toutes les 5s

3. **Fermez la première fenêtre** (celle avec les produits)
   - La deuxième devrait automatiquement être activée ! 🎉

### Étape 6 : Tester avec Plus d'Utilisateurs

Pour tester avec 3+ utilisateurs simultanés :

```bash
# Augmentez légèrement la limite
QUEUE_MAX_CONCURRENT_USERS=2
```

Puis ouvrez 4-5 onglets incognito :
- 2 premiers → Produits
- 3ème, 4ème, 5ème → File d'attente (positions 1, 2, 3)

## 🔍 Vérification avec Redis CLI

```bash
# Se connecter à Redis
docker-compose exec redis redis-cli

# Voir les utilisateurs actifs
SMEMBERS queue:active_users

# Voir la file d'attente
ZRANGE queue:waiting 0 -1 WITHSCORES

# Compter les actifs
SCARD queue:active_users

# Compter ceux en attente
ZCARD queue:waiting
```

## 📊 Vérifier les Stats via API

```bash
# Dans un terminal
curl http://localhost:8000/api/queue/stats

# Résultat :
{
  "active_users": 1,
  "waiting_users": 2,
  "max_concurrent_users": 1,
  "queue_enabled": true
}
```

## 🎯 Scénarios de Test

### Scénario 1 : Surcharge Simple (200%)
```
QUEUE_MAX_CONCURRENT_USERS=1
Utilisateurs : 2
Résultat : 1 actif, 1 en attente
```

### Scénario 2 : Forte Surcharge (500%)
```
QUEUE_MAX_CONCURRENT_USERS=2
Utilisateurs : 10
Résultat : 2 actifs, 8 en attente
```

### Scénario 3 : Trafic Massif (1000%)
```
QUEUE_MAX_CONCURRENT_USERS=10
Utilisateurs : 100
Résultat : 10 actifs, 90 en attente
```

## 🚨 Problèmes Courants

### La file ne s'active pas
1. Vérifiez que `QUEUE_ENABLED=true` dans `.env`
2. Redémarrez le backend : `docker-compose restart backend`
3. Videz le cache Redis : `docker-compose exec redis redis-cli FLUSHALL`

### Tous les utilisateurs passent
1. Vérifiez la valeur de `QUEUE_MAX_CONCURRENT_USERS`
2. Les sessions dans le même navigateur partagent le localStorage
3. Utilisez des navigateurs différents ou incognito

### La position ne se met pas à jour
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs réseau
3. Vérifiez que le backend est accessible : http://localhost:8000/api/queue/stats

## 🧹 Réinitialiser le Test

```bash
# Vider toutes les données Redis
docker-compose exec redis redis-cli FLUSHALL

# Ou redémarrer tous les services
docker-compose restart

# Ou tout reconstruire
docker-compose down
docker-compose up -d --build
```

## 💡 Astuce Pro

Pour voir la file d'attente IMMÉDIATEMENT dès la première visite :

```env
# Dans backend/.env
QUEUE_MAX_CONCURRENT_USERS=0
```

Tous les utilisateurs seront en file d'attente ! 😄

## 📱 Test sur Mobile

1. Trouvez votre IP locale :
   ```bash
   # Sur Mac/Linux
   ifconfig | grep inet

   # Sur Windows
   ipconfig
   ```

2. Modifiez `frontend-nextjs-v16/.env.local` :
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.X:8000
   ```

3. Accédez depuis mobile :
   ```
   http://192.168.1.X:3000
   ```

## 🎬 Démo Automatisée

Script pour simuler 10 utilisateurs :

```bash
#!/bin/bash
# test-queue.sh

for i in {1..10}
do
  session_id=$(uuidgen)
  curl -X GET "http://localhost:8000/api/queue/status?session_id=$session_id" \
       -H "X-Session-Id: $session_id" &
done

wait
echo "Test terminé !"
```

Rendez-le exécutable :
```bash
chmod +x test-queue.sh
./test-queue.sh
```
