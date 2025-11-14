# Library Directory (`/lib`)

## 📋 Vue d'Ensemble

Le dossier `lib` contient toutes les utilitaires, helpers, et configurations partagées du projet Next.js. Cette architecture modulaire favorise la **réutilisabilité**, la **maintenabilité**, et le **DRY principle** (Don't Repeat Yourself).

## 📁 Structure

```
lib/
├── helpers/
│   ├── index.ts          # Point d'export centralisé
│   ├── session.ts        # Gestion des sessions (localStorage)
│   ├── url.ts           # Construction et manipulation d'URLs
│   └── fetch.ts         # Wrappers fetch API
├── api-client.ts        # Client API principal (singleton)
├── api.ts               # API legacy (backward compatibility)
├── constants.ts         # Constantes globales
├── query-client.ts      # Configuration TanStack Query
├── utils.ts             # Utilitaires UI (cn, clsx)
└── README.md            # Cette documentation
```

## 🔧 Modules Principaux

### 1. **Constants** (`constants.ts`)

Toutes les constantes de l'application centralisées.

#### Constantes disponibles :

```typescript
import {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_HEADERS,
  HTTP_STATUS,
  CACHE_TIMES,
  QUERY_STALE_TIMES,
  QUERY_CACHE_CONFIG,
} from '@/lib/constants';
```

**Exemples d'utilisation :**

```typescript
// Base URL
const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`;

// Headers
const headers = {
  [HTTP_HEADERS.CONTENT_TYPE]: 'application/json',
  [HTTP_HEADERS.SESSION_ID]: sessionId,
};

// Status codes
if (response.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
  // Handle rate limit
}

// Cache times
fetch(url, { cache: 'no-store', next: { revalidate: CACHE_TIMES.MEDIUM } });
```

---

### 2. **Helpers** (`helpers/`)

Fonctions utilitaires modulaires et réutilisables.

#### 2.1 Session Helpers (`helpers/session.ts`)

Gestion des sessions utilisateur avec localStorage.

```typescript
import {
  getSessionId,
  setSessionId,
  removeSessionId,
  generateSessionId,
  getOrCreateSessionId,
} from '@/lib/helpers';

// Récupérer session ID (retourne null si SSR)
const sessionId = getSessionId();

// Définir session ID
setSessionId('my-session-id');

// Générer nouvelle session ID (UUID v4)
const newId = generateSessionId();

// Récupérer ou créer automatiquement
const id = getOrCreateSessionId(); // Génère si n'existe pas

// Supprimer session
removeSessionId();
```

#### 2.2 URL Helpers (`helpers/url.ts`)

Construction et manipulation d'URLs avec query params.

```typescript
import { buildUrl, addQueryParams, parseQueryParams } from '@/lib/helpers';

// Construire URL avec params
const url = buildUrl(
  'http://localhost:8000',
  '/api/products',
  { category: 'electronics', sort: 'price' }
);
// Résultat: http://localhost:8000/api/products?category=electronics&sort=price

// Ajouter params à URL existante
const newUrl = addQueryParams('http://example.com', { page: 2 });

// Parser params d'une URL
const params = parseQueryParams('http://example.com?foo=bar&baz=42');
// Résultat: { foo: 'bar', baz: '42' }
```

#### 2.3 Fetch Helpers (`helpers/fetch.ts`)

Wrappers pour l'API fetch native avec gestion d'erreurs.

```typescript
import {
  fetchApi,
  get,
  post,
  put,
  patch,
  del,
  createHeaders,
  handleApiError,
} from '@/lib/helpers';

// Requête GET simple
const products = await get<Product[]>(
  API_BASE_URL,
  '/api/products',
  { sessionId: 'xxx', params: { category: 'books' } }
);

// Requête POST
const order = await post<Order>(
  API_BASE_URL,
  '/api/orders',
  { items: [...] },
  { sessionId: 'xxx' }
);

// Gestion d'erreurs
try {
  await post(...);
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
}

// Créer headers personnalisés
const headers = createHeaders('session-id', {
  'X-Custom-Header': 'value'
});
```

**Options disponibles pour `fetchApi` :**

```typescript
type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  sessionId?: string;
  body?: any;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: HeadersInit;
  cache?: RequestCache;
  revalidate?: number | false;  // Next.js 16
  tags?: string[];               // Next.js 16
};
```

---

### 3. **API Client** (`api-client.ts`)

Client API principal avec singleton pattern.

```typescript
import { apiClient, serverFetch } from '@/lib/api-client';

// ====== Client-Side Usage ======
'use client';

// Queue API
const status = await apiClient.getQueueStatus(sessionId);
await apiClient.sendHeartbeat(sessionId);
await apiClient.releaseSession(sessionId);

// Products API
const { products } = await apiClient.getProducts({ category: 'electronics' });
const { product } = await apiClient.getProduct(1, sessionId);

// Orders API
const { order } = await apiClient.createOrder({ items: [...] }, sessionId);
const { orders } = await apiClient.getOrders(sessionId);

// Admin API
const dashboard = await apiClient.getAdminDashboard();
await apiClient.kickUser(sessionId);
await apiClient.updateQueueConfig({ max_concurrent_users: 200 });

// ====== Server-Side Usage ======
// Server Components & Server Actions

const products = await serverFetch<Product[]>('/api/products', {
  cache: 'no-store',
  revalidate: 60, // Revalidate every 60 seconds
  tags: ['products'], // Cache tags for invalidation
});
```

**Avantages :**
- ✅ Singleton pattern (une seule instance)
- ✅ Auto-injection du session ID
- ✅ Gestion d'erreurs centralisée
- ✅ Compatible SSR/CSR
- ✅ TypeScript avec types stricts

---

### 4. **API Legacy** (`api.ts`)

API wrapper pour backward compatibility avec l'ancien code.

```typescript
import { queueApi, productApi, adminApi, ecommerceApi } from '@/lib/api';

// Queue API
const status = await queueApi.checkStatus(sessionId);
await queueApi.sendHeartbeat(sessionId);

// Admin API
const dashboard = await adminApi.getDashboard();
const stats = await adminApi.getStats();

// E-commerce API
const { products } = await ecommerceApi.getProducts({ category: 'books' });
const order = await ecommerceApi.createOrder(orderData, sessionId);

// Legacy axios-style (NO axios, native fetch wrapper)
import { api } from '@/lib/api';

const { data } = await api.get<Product[]>('/api/products', {
  params: { category: 'electronics' }
});

const { data: order } = await api.post<Order>('/api/orders', orderData);
```

---

### 5. **TanStack Query** (`query-client.ts`)

Configuration de TanStack Query (React Query) avec cache optimisé.

```typescript
import { getQueryClient, queryKeys } from '@/lib/query-client';

// ====== In Client Components ======
'use client';
import { useQuery } from '@tanstack/react-query';

function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.list({ category: 'electronics' }),
    queryFn: () => apiClient.getProducts({ category: 'electronics' }),
  });
}

// ====== In Server Components ======
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => serverFetch('/api/products'),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList />
    </HydrationBoundary>
  );
}
```

**Query Keys disponibles :**

```typescript
queryKeys.queue.status(sessionId)
queryKeys.queue.stats()
queryKeys.products.list({ category?: string })
queryKeys.products.detail(id)
queryKeys.orders.list(sessionId)
queryKeys.orders.detail(id)
queryKeys.admin.dashboard()
```

**Configuration par défaut :**
- Stale time: 5 minutes
- GC time: 10 minutes
- Retry: 1 fois pour queries, 0 fois pour mutations
- Pas de refetch automatique sur window focus

---

### 6. **UI Utils** (`utils.ts`)

Utilitaires pour la gestion des classes CSS (Tailwind + clsx).

```typescript
import { cn } from '@/lib/utils';

// Combiner classes conditionnellement
<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)} />

// Merger classes Tailwind
<Button className={cn(buttonVariants({ variant: 'outline' }), 'my-4')} />
```

---

## 🎯 Bonnes Pratiques

### 1. **Imports**

```typescript
// ✅ BON - Import depuis helpers/index.ts
import { getSessionId, buildUrl, post } from '@/lib/helpers';

// ❌ ÉVITER - Import direct des sous-modules
import { getSessionId } from '@/lib/helpers/session';
```

### 2. **Constantes**

```typescript
// ✅ BON - Utiliser les constantes
const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`;

// ❌ ÉVITER - Hardcoder les valeurs
const url = 'http://localhost:8000/api/products';
```

### 3. **Fetch Helpers**

```typescript
// ✅ BON - Utiliser les wrappers typés
const products = await get<Product[]>(API_BASE_URL, '/api/products');

// ❌ ÉVITER - Fetch brut
const response = await fetch('http://localhost:8000/api/products');
const products = await response.json();
```

### 4. **API Client**

```typescript
// ✅ BON - Utiliser le singleton
import { apiClient } from '@/lib/api-client';
const products = await apiClient.getProducts();

// ❌ ÉVITER - Créer de nouvelles instances
import { ApiClient } from '@/lib/api-client';
const client = new ApiClient(); // NE PAS FAIRE
```

### 5. **Server vs Client**

```typescript
// ✅ Server Components - Utiliser serverFetch
import { serverFetch } from '@/lib/api-client';
const data = await serverFetch('/api/products', { cache: 'no-store' });

// ✅ Client Components - Utiliser apiClient
'use client';
import { apiClient } from '@/lib/api-client';
const data = await apiClient.getProducts();
```

---

## 📦 Dépendances

- **TanStack Query** v5.62+
- **Next.js** 16+
- **TypeScript** 5.7+
- **clsx** + **tailwind-merge**

---

## 🚀 Migration Guide

### Migrer de l'ancien code vers les nouveaux helpers

**Avant :**
```typescript
// Code dupliqué partout
function getSessionId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session_id');
}

const url = `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=books`;
const response = await fetch(url);
```

**Après :**
```typescript
import { getSessionId, buildUrl, get, API_BASE_URL } from '@/lib/helpers';

const sessionId = getSessionId();
const products = await get<Product[]>(
  API_BASE_URL,
  '/api/products',
  { params: { category: 'books' } }
);
```

---

## 🔍 Avantages de cette Architecture

1. ✅ **DRY** : Pas de duplication de code
2. ✅ **Type Safety** : TypeScript strict sur tous les helpers
3. ✅ **Modularité** : Chaque helper a une responsabilité unique
4. ✅ **Testabilité** : Fonctions pures faciles à tester
5. ✅ **Maintenabilité** : Modifications centralisées
6. ✅ **SSR/CSR Compatible** : Fonctionne côté serveur et client
7. ✅ **Next.js 16 Optimized** : Support cache, revalidate, tags
8. ✅ **NO External HTTP Libraries** : Pure fetch API, zero dépendances

---

## 📝 Notes

- Tous les helpers gèrent automatiquement SSR (retourne `null` si `window` undefined)
- Les constantes utilisent `as const` pour l'inférence de types stricte
- Le client API utilise un singleton pour éviter les instances multiples
- TanStack Query est configuré pour un caching optimal (5 min stale, 10 min GC)
- Tous les types sont définis dans `/types` et importés depuis `@/types`

---

## 🤝 Contribution

Pour ajouter un nouveau helper :

1. Créer le fichier dans `helpers/`
2. Exporter les fonctions depuis `helpers/index.ts`
3. Documenter dans ce README
4. Ajouter des tests unitaires

---

**Documentation générée le** : 2025-01-14
**Version** : 1.0.0
