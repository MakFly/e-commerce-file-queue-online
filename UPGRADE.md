# 🚀 Upgrade Guide - Next.js 16 & Native Fetch

## Vue d'ensemble

Ce projet a été entièrement mis à niveau vers les dernières versions de Next.js 16, React 19, et utilise maintenant exclusivement l'API `fetch` native (sans axios).

---

## 📋 Changements Majeurs

### 1. Next.js 14 → 16

**Avant :**
```json
"next": "14.0.4"
```

**Après :**
```json
"next": "^16.0.0"
```

**Nouveautés Next.js 16 :**
- ✅ **Turbopack Stable** : Bundler par défaut, 5-10x plus rapide
- ✅ **React Compiler** : Optimisation automatique du rendu
- ✅ **Cache Components** : Nouveau modèle avec PPR (Partial Pre-Rendering)
- ✅ **Native Fetch** : Support amélioré avec cache tags et revalidation

### 2. React 18 → 19

**Avant :**
```json
"react": "18.2.0",
"react-dom": "18.2.0"
```

**Après :**
```json
"react": "^19.0.0",
"react-dom": "^19.0.0"
```

**Nouveautés React 19 :**
- Compiler intégré pour optimisation automatique
- Memoization automatique
- Meilleures performances
- Server Components améliorés

### 3. TypeScript 5.3 → 5.7

**Avant :**
```json
"typescript": "5.3.3"
```

**Après :**
```json
"typescript": "^5.7.2"
```

### 4. Axios → Native Fetch ❌

**IMPORTANT : Axios a été complètement supprimé du projet !**

**Avant :**
```typescript
import axios from 'axios';

const response = await axios.get('/api/products');
```

**Après :**
```typescript
// Utilisation du nouveau API Client
import { apiClient } from '@/lib/api-client';

const { products } = await apiClient.getProducts();

// OU utilisation de serverFetch pour Server Components
import { serverFetch } from '@/lib/api-client';

const data = await serverFetch('/api/products', {
  cache: 'force-cache',
  revalidate: 3600,
  tags: ['products'],
});
```

---

## 🔄 Migration du Code

### API Client

**Ancien code (avec axios) :**
```typescript
import axios from 'axios';

const response = await axios.post('/api/orders', orderData, {
  headers: { 'X-Session-Id': sessionId },
});
```

**Nouveau code (avec fetch natif) :**
```typescript
import { apiClient } from '@/lib/api-client';

const { order } = await apiClient.createOrder(orderData, sessionId);
```

### Legacy API

Si vous utilisez l'ancien fichier `lib/api.ts`, **il a été migré vers fetch mais garde la même interface** :

```typescript
// Continue de fonctionner !
import { queueApi, ecommerceApi, adminApi } from '@/lib/api';

const status = await queueApi.checkStatus(sessionId);
const { products } = await ecommerceApi.getProducts();
```

### Server Actions

Les Server Actions fonctionnent toujours de la même manière :

```typescript
'use server';

import { apiClient } from '@/lib/api-client';

export async function createOrderAction(data, sessionId) {
  const result = await apiClient.createOrder(data, sessionId);
  revalidatePath('/orders');
  return { success: true, data: result.order };
}
```

### TanStack Query Hooks

Aucun changement requis ! Les hooks continuent de fonctionner :

```typescript
import { useProducts, useCreateOrder } from '@/hooks/use-products';

function ProductList() {
  const { data: products, isLoading } = useProducts();
  // ...
}
```

---

## 📦 Installation des Dépendances

### 1. Supprimer l'ancien node_modules

```bash
cd frontend
rm -rf node_modules package-lock.json
```

### 2. Installer les nouvelles dépendances

```bash
npm install
```

### 3. Vérifier la configuration

Assurez-vous que votre `package.json` contient :

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.62.0",
    "react-hook-form": "^7.54.0",
    "zod": "^3.24.1",
    "sonner": "^1.7.0"
  }
}
```

**IMPORTANT : `axios` NE DOIT PAS apparaître dans les dépendances !**

---

## 🏃 Lancer le Projet

### Mode Développement (avec Turbopack)

```bash
npm run dev
```

Le site sera disponible sur [http://localhost:3000](http://localhost:3000)

**Turbopack est maintenant activé par défaut !** Vous devriez voir :

```
✓ Ready in 1.2s
✓ Local:    http://localhost:3000
✓ Turbopack: enabled
```

### Build Production

```bash
npm run build
npm start
```

---

## 🔍 Vérifications Post-Upgrade

### 1. Vérifier qu'axios n'est plus présent

```bash
cd frontend
npm list axios
# Devrait afficher : (empty)
```

### 2. Tester les endpoints

```bash
# Test API
curl http://localhost:8000/api/products

# Test Queue
curl http://localhost:8000/api/queue/stats
```

### 3. Tester le frontend

1. Ouvrir [http://localhost:3000](http://localhost:3000)
2. Vérifier la file d'attente
3. Parcourir les produits
4. Ajouter au panier
5. Finaliser une commande

---

## 🐛 Résolution des Problèmes

### Erreur : "Cannot find module 'axios'"

**Solution :** Axios a été supprimé. Vérifiez que vous n'avez pas d'imports `axios` dans votre code :

```bash
# Chercher les imports axios restants
grep -r "from 'axios'" frontend/src/
grep -r 'from "axios"' frontend/src/
```

Si vous trouvez des imports, remplacez-les par le nouveau API client :

```typescript
// Remplacer
import axios from 'axios';

// Par
import { apiClient } from '@/lib/api-client';
```

### Erreur : "React version mismatch"

**Solution :** Supprimez node_modules et réinstallez :

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : TypeScript compilation

**Solution :** Vérifiez que TypeScript est à jour :

```bash
npm install typescript@latest @types/react@latest @types/react-dom@latest --save-dev
```

### Turbopack ne démarre pas

**Solution :** Turbopack nécessite Node.js 20.9.0+

```bash
node --version  # Doit afficher v20.9.0 ou supérieur
```

Si votre version est inférieure, installez Node.js 20 LTS :

```bash
# Avec nvm
nvm install 20
nvm use 20

# OU téléchargez depuis https://nodejs.org/
```

---

## 📝 Changements dans l'Architecture

### Nouveau Flux HTTP

```
Client Component
    │
    ├─→ apiClient.getProducts()
    │       │
    │       └─→ fetch(url, {
    │              headers: { 'X-Session-Id': sessionId },
    │              cache: 'no-store',
    │           })
    │           │
    │           └─→ Laravel Backend
    │
    └─→ Server Action
            │
            └─→ serverFetch('/api/orders', {
                   cache: 'force-cache',
                   revalidate: 60,
                   tags: ['orders'],
                })
                │
                └─→ Laravel Backend
```

### Cache Strategy

Next.js 16 offre un contrôle granulaire du cache avec fetch :

```typescript
// Pas de cache (par défaut pour mutations)
await fetch(url, { cache: 'no-store' })

// Cache permanent
await fetch(url, { cache: 'force-cache' })

// Cache avec revalidation toutes les 60 secondes
await fetch(url, { next: { revalidate: 60 } })

// Cache avec tags pour invalidation ciblée
await fetch(url, { next: { tags: ['products'] } })
```

---

## 🎯 Meilleures Pratiques

### 1. Utiliser le bon API client

**Client Components** :
```typescript
import { apiClient } from '@/lib/api-client';
const data = await apiClient.getProducts();
```

**Server Components / Server Actions** :
```typescript
import { serverFetch } from '@/lib/api-client';
const data = await serverFetch('/api/products', {
  cache: 'force-cache',
  revalidate: 3600,
});
```

### 2. Gérer les erreurs

```typescript
try {
  const data = await apiClient.getProducts();
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
  // Afficher une erreur à l'utilisateur
}
```

### 3. Utiliser TanStack Query pour le cache

```typescript
import { useProducts } from '@/hooks/use-products';

function ProductList() {
  const { data, isLoading, error } = useProducts();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data.map(product => ...)}</div>;
}
```

---

## ✅ Checklist Finale

- [ ] `node_modules` supprimé et réinstallé
- [ ] `npm list axios` retourne `(empty)`
- [ ] `npm run dev` démarre avec Turbopack
- [ ] Les pages se chargent correctement
- [ ] La file d'attente fonctionne
- [ ] Les produits s'affichent
- [ ] Le panier fonctionne
- [ ] Les commandes se créent
- [ ] Aucune erreur dans la console
- [ ] Les types TypeScript sont corrects

---

## 📚 Ressources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Release Notes](https://react.dev/blog)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Turbopack Documentation](https://turbo.build/pack/docs)

---

## 🎉 Félicitations !

Votre projet est maintenant à jour avec Next.js 16, React 19, et utilise l'API fetch native !

Profitez de :
- ⚡ Fast Refresh 5-10x plus rapide avec Turbopack
- 🚀 Performances améliorées avec React 19
- 🎯 Code plus simple sans dépendances HTTP externes
- 📦 Bundle plus léger sans axios
- 🔄 Meilleur contrôle du cache avec fetch natif
