# 🏗️ Architecture Next.js Moderne - Documentation

## Vue d'ensemble

Cette documentation décrit l'architecture moderne mise en place pour le frontend **Next.js 16**, utilisant les toutes dernières fonctionnalités et meilleures pratiques recommandées par Vercel et la communauté React.

---

## 📦 Stack Technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.0.0 | Framework React avec App Router & Turbopack |
| **React** | 19.0.0 | Librairie UI avec React Compiler |
| **TypeScript** | 5.7.2 | Typage statique |
| **TanStack Query** | 5.62.0 | Data fetching et cache management |
| **React Hook Form** | 7.54.0 | Gestion des formulaires |
| **Zod** | 3.24.1 | Validation de schémas |
| **Native Fetch API** | Built-in | HTTP client (NO external libraries) |
| **Sonner** | 1.7.0 | Toast notifications |
| **shadcn/ui** | Latest | Composants UI |

### 🚀 Nouveautés Next.js 16

- **Turbopack Stable** : Bundler par défaut avec Fast Refresh 5-10x plus rapide
- **React 19 Support** : React Compiler intégré pour optimisation automatique
- **Cache Components** : Nouveau modèle de programmation avec Partial Pre-Rendering (PPR)
- **Native Fetch** : Utilisation exclusive de l'API fetch native (pas de dépendances externes)

---

## 🗂️ Structure du Projet

```
frontend-nextjs-v16/
├── src/
│   ├── app/                          # App Router (Next.js 16)
│   │   ├── actions/                  # Server Actions
│   │   │   ├── order.ts             # Order mutations
│   │   │   └── product.ts           # Product actions
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── label.tsx
│   │   │   └── separator.tsx
│   │   └── forms/                   # Form components
│   │       └── CheckoutForm.tsx     # Example with RHF + Zod
│   │
│   ├── hooks/                       # Custom hooks
│   │   ├── use-products.ts         # Product queries
│   │   ├── use-orders.ts           # Order queries & mutations
│   │   └── use-queue-query.ts      # Queue management with React Query
│   │
│   ├── lib/                         # Core utilities
│   │   ├── api-client.ts           # API client (SSR compatible)
│   │   ├── query-client.ts         # TanStack Query config
│   │   ├── utils.ts                # Helper functions (cn)
│   │   └── validations/            # Zod schemas
│   │       ├── checkout.ts         # Checkout validation
│   │       └── product.ts          # Product validation
│   │
│   ├── providers/                  # React providers
│   │   └── query-provider.tsx      # TanStack Query provider
│   │
│   └── contexts/                   # React contexts
│       └── CartContext.tsx         # Shopping cart state
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🔄 Architecture de Données

### Flux de Données Global

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT COMPONENT                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Hook Form + Zod Validation                     │  │
│  │  (Validation côté client)                             │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Server Action (use server)                           │  │
│  │  - Validation Zod côté serveur                        │  │
│  │  - Appel API via api-client                           │  │
│  │  - revalidatePath/revalidateTag                       │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API CLIENT (SSR)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Axios Instance                                        │  │
│  │  - Auto session ID injection                          │  │
│  │  - Error handling                                     │  │
│  │  - Type-safe responses                                │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  LARAVEL BACKEND                             │
│  Queue Middleware → Controllers → Redis/MySQL               │
└─────────────────────────────────────────────────────────────┘
```

### Flux avec TanStack Query

```
Client Component
    │
    ├─ useProducts()
    │     └─→ TanStack Query
    │           ├─ Cache check
    │           ├─ Background refetch
    │           └─→ apiClient.getProducts()
    │                  └─→ Laravel API
    │
    ├─ useCreateOrder()
    │     └─→ useMutation
    │           ├─ apiClient.createOrder()
    │           ├─ onSuccess: invalidateQueries
    │           └─ onError: toast.error
    │
    └─ useQueueStatus()
          └─→ useQuery with refetchInterval
                └─→ apiClient.getQueueStatus()
```

---

## 🎯 Composants Clés

### 1. API Client (`lib/api-client.ts`)

**Rôle** : Client HTTP centralisé, compatible SSR et CSR.

**Caractéristiques** :
- ✅ Singleton pour utilisation client
- ✅ Factory pour utilisation serveur
- ✅ Auto-injection du session ID
- ✅ Gestion d'erreurs unifiée
- ✅ Types TypeScript complets

**Exemple d'utilisation** :

```typescript
// Client-side (with session from localStorage)
import { apiClient } from '@/lib/api-client';

const products = await apiClient.getProducts({ category: 'electronics' });

// Server-side (with explicit session)
import { createApiClient } from '@/lib/api-client';

const { client } = createApiClient(sessionId);
const response = await client.get('/api/products');
```

**Méthodes disponibles** :
- `getQueueStatus(sessionId)` - Statut de la file
- `sendHeartbeat(sessionId)` - Maintenir la session
- `releaseSession(sessionId)` - Libérer la session
- `getProducts(params)` - Liste des produits
- `getProduct(id)` - Détail d'un produit
- `createOrder(data, sessionId)` - Créer une commande
- `getOrders(sessionId)` - Liste des commandes
- `getAdminDashboard()` - Dashboard admin
- `kickUser(sessionId)` - Expulser un utilisateur (admin)
- `clearQueue()` - Vider la file (admin)
- `updateQueueConfig(config)` - Modifier la config (admin)

---

### 2. TanStack Query (`lib/query-client.ts`)

**Rôle** : Gestion du cache, requêtes, et mutations avec optimisation automatique.

**Configuration** :

```typescript
const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,    // 5 minutes
    gcTime: 10 * 60 * 1000,      // 10 minutes (cache)
  },
  mutations: {
    retry: 0,
  },
};
```

**Query Keys Factory** :

```typescript
export const queryKeys = {
  queue: {
    all: ['queue'],
    status: (sessionId: string) => ['queue', 'status', sessionId],
    stats: () => ['queue', 'stats'],
  },
  products: {
    all: ['products'],
    lists: () => ['products', 'list'],
    list: (filters?) => ['products', 'list', filters],
    details: () => ['products', 'detail'],
    detail: (id: number) => ['products', 'detail', id],
  },
  orders: {
    all: ['orders'],
    lists: () => ['orders', 'list'],
    list: (sessionId?) => ['orders', 'list', sessionId],
    details: () => ['orders', 'detail'],
    detail: (id: number) => ['orders', 'detail', id],
  },
  admin: {
    all: ['admin'],
    dashboard: () => ['admin', 'dashboard'],
  },
};
```

**Avantages** :
- 🚀 Cache automatique
- 🔄 Refetch intelligent
- 📡 Polling pour real-time
- 🎯 Invalidation ciblée
- 💾 Persistence optionnelle

---

### 3. Validation Zod (`lib/validations/`)

**Rôle** : Validation type-safe des données côté client ET serveur.

**Exemple - Checkout Schema** :

```typescript
export const checkoutSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  shipping_address: z.string().min(5).max(255),
  shipping_city: z.string().min(2).max(100),
  shipping_postal_code: z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/),
  shipping_country: z.string().default('France'),
  payment_method: z.enum(['credit_card', 'debit_card', 'paypal']),
  card_number: z.string().regex(/^[0-9]{16}$/).optional(),
  card_expiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/).optional(),
  card_cvv: z.string().regex(/^[0-9]{3,4}$/).optional(),
  items: z.array(z.object({
    product_id: z.number().int().positive(),
    quantity: z.number().int().positive().max(100),
  })).min(1),
}).refine(
  (data) => {
    if (data.payment_method === 'credit_card' || data.payment_method === 'debit_card') {
      return !!data.card_number && !!data.card_expiry && !!data.card_cvv;
    }
    return true;
  },
  { message: 'Card details required', path: ['card_number'] }
);

// Type inference
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
```

**Utilisation avec React Hook Form** :

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
  resolver: zodResolver(checkoutSchema),
});
```

---

### 4. Server Actions (`app/actions/`)

**Rôle** : Mutations côté serveur avec Next.js 14+.

**Exemple - Create Order Action** :

```typescript
'use server';

export async function createOrderAction(
  formData: CreateOrderData,
  sessionId: string
): Promise<ActionResult<Order>> {
  try {
    // 1. Validation Zod
    const validatedData = checkoutSchema.parse(formData);

    // 2. API call
    const response = await apiClient.createOrder(validatedData, sessionId);

    // 3. Revalidation
    revalidatePath('/orders');
    revalidatePath('/cart');

    return { success: true, data: response.order };
  } catch (error) {
    return { success: false, error: 'Failed to create order' };
  }
}
```

**Avantages** :
- 🔒 Sécurité : Code serveur uniquement
- 🎯 Progressive Enhancement
- 🚀 Streaming SSR compatible
- 📝 Type-safe avec TypeScript

---

### 5. Custom Hooks (`hooks/`)

#### useProducts

```typescript
export function useProducts(params?: { category?: string; sessionId?: string }) {
  return useQuery({
    queryKey: queryKeys.products.list(params?.category ? { category: params.category } : undefined),
    queryFn: async () => {
      const response = await apiClient.getProducts(params);
      return response.products;
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

**Utilisation** :

```tsx
function ProductList() {
  const { data: products, isLoading, error } = useProducts({ category: 'electronics' });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}
```

#### useCreateOrder (Mutation)

```typescript
export function useCreateOrder(sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await apiClient.createOrder(data, sessionId);
      return response.order;
    },
    onSuccess: (data) => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });

      toast.success('Order created!', {
        description: `Order #${data.order_number}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create order', {
        description: error.message,
      });
    },
  });
}
```

**Utilisation** :

```tsx
function CheckoutButton() {
  const createOrder = useCreateOrder(sessionId);

  const handleCheckout = () => {
    createOrder.mutate(orderData);
  };

  return (
    <Button onClick={handleCheckout} disabled={createOrder.isPending}>
      {createOrder.isPending ? 'Processing...' : 'Place Order'}
    </Button>
  );
}
```

#### useQueueStatus (Polling)

```typescript
export function useQueueStatus(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.queue.status(sessionId),
    queryFn: async () => {
      return await apiClient.getQueueStatus(sessionId);
    },
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0,
  });
}
```

---

### 6. React Hook Form Integration

**Exemple complet** :

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function CheckoutForm({ sessionId, items }: Props) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_country: 'France',
      payment_method: 'credit_card',
      items,
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    const result = await createOrderAction(data, sessionId);

    if (result.success) {
      toast.success('Order placed!');
      router.push(`/confirmation?order=${result.data.order_number}`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('customer_name')} />
      {errors.customer_name && <p>{errors.customer_name.message}</p>}

      <Input {...register('customer_email')} type="email" />
      {errors.customer_email && <p>{errors.customer_email.message}</p>}

      <Button type="submit">Place Order</Button>
    </form>
  );
}
```

**Caractéristiques** :
- ✅ Validation temps réel
- ✅ Messages d'erreur personnalisés
- ✅ Type safety complet
- ✅ Performance optimale (re-render minimal)

---

## 🎨 Patterns Utilisés

### 1. Repository Pattern (API Client)

L'API client encapsule toutes les requêtes HTTP :

```typescript
class ApiClient {
  async getProducts() { /* ... */ }
  async createOrder() { /* ... */ }
  // Centralized error handling
  // Session management
  // Type safety
}
```

### 2. Query Keys Factory

Centralisation des clés de cache :

```typescript
const queryKeys = {
  products: {
    all: ['products'],
    list: (filters) => [...queryKeys.products.all, 'list', filters],
    detail: (id) => [...queryKeys.products.all, 'detail', id],
  },
};

// Usage
queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
```

### 3. Custom Hooks Pattern

Encapsulation de la logique de data fetching :

```typescript
export function useProducts() {
  return useQuery({ /* ... */ });
}

// Composant reste simple
function ProductList() {
  const { data } = useProducts();
  return <div>{/* render */}</div>;
}
```

### 4. Server Actions Pattern

Mutations sécurisées côté serveur :

```typescript
'use server';

export async function createOrderAction(data) {
  // Server-only code
  // Database access
  // Validation
  // Revalidation
}
```

### 5. Provider Pattern

Wrapping de providers pour configuration globale :

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## 🔐 Sécurité

### 1. Validation Double

**Client** : Validation immédiate avec Zod + RHF
**Serveur** : Re-validation dans Server Actions

```typescript
// Client
const { register } = useForm({ resolver: zodResolver(schema) });

// Server
export async function action(data) {
  const validated = schema.parse(data); // Re-validate
}
```

### 2. Session Management

Session ID stocké dans localStorage, injecté automatiquement :

```typescript
function getSessionId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session_id');
}
```

### 3. Error Handling

Gestion centralisée des erreurs :

```typescript
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };
  }
  return { message: 'Unknown error' };
}
```

---

## 📊 Performance

### 1. Cache Strategy

```typescript
queries: {
  staleTime: 5 * 60 * 1000,    // Consider fresh for 5 min
  gcTime: 10 * 60 * 1000,      // Keep in cache for 10 min
  refetchOnWindowFocus: false, // Don't refetch on focus
  refetchOnMount: false,       // Don't refetch on mount if fresh
}
```

### 2. Optimistic Updates

```typescript
const mutation = useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['orders'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['orders']);

    // Optimistically update
    queryClient.setQueryData(['orders'], (old) => [...old, newData]);

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['orders'], context.previous);
  },
});
```

### 3. Prefetching

```typescript
// Prefetch products on hover
<Link
  href="/products"
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.lists(),
      queryFn: () => apiClient.getProducts(),
    });
  }}
>
  Products
</Link>
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// hooks/use-products.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from './use-products';

test('fetches products', async () => {
  const { result } = renderHook(() => useProducts());

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toHaveLength(15);
});
```

### Integration Tests

```typescript
// components/CheckoutForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutForm } from './CheckoutForm';

test('submits form with valid data', async () => {
  render(<CheckoutForm sessionId="test" items={[]} />);

  fireEvent.change(screen.getByLabelText('Full Name'), {
    target: { value: 'John Doe' },
  });

  fireEvent.click(screen.getByText('Place Order'));

  await waitFor(() => {
    expect(screen.getByText('Order placed!')).toBeInTheDocument();
  });
});
```

---

## 🚀 Best Practices

### 1. Always Use TypeScript

```typescript
// ✅ Good
const products: Product[] = await apiClient.getProducts();

// ❌ Bad
const products = await apiClient.getProducts();
```

### 2. Centralize Query Keys

```typescript
// ✅ Good
queryKey: queryKeys.products.list({ category })

// ❌ Bad
queryKey: ['products', 'list', category]
```

### 3. Handle Loading and Error States

```typescript
// ✅ Good
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;

// ❌ Bad
return <div>{data?.map(...)}</div>; // May crash
```

### 4. Use Suspense for Data Fetching

```typescript
// ✅ Good
export function ProductList() {
  const { data } = useProductsSuspense();
  return <div>{data.map(...)}</div>;
}

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <ProductList />
</Suspense>
```

### 5. Invalidate Queries After Mutations

```typescript
// ✅ Good
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
}

// ❌ Bad
onSuccess: () => {
  // No invalidation → stale data
}
```

---

## 📚 Ressources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## ✨ Conclusion

Cette architecture moderne offre :

- ✅ **Type Safety** complet avec TypeScript + Zod
- ✅ **Performance** optimale avec TanStack Query
- ✅ **Developer Experience** excellente avec RHF
- ✅ **SSR Compatible** avec Next.js 14
- ✅ **Scalable** et maintenable
- ✅ **Testable** facilement
- ✅ **Production Ready**

Le projet est maintenant prêt pour une utilisation en production avec toutes les meilleures pratiques de l'écosystème React/Next.js !
