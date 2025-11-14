# 🤖 AI-DD - AI-Driven Development Guide

## Vue d'ensemble

Ce document définit les bonnes pratiques et conventions pour le développement assisté par IA de ce projet Laravel + Next.js.

---

## 📋 Table des Matières

1. [Principes Fondamentaux](#principes-fondamentaux)
2. [Laravel Best Practices](#laravel-best-practices)
3. [Next.js 16 Best Practices](#nextjs-16-best-practices)
4. [TypeScript Conventions](#typescript-conventions)
5. [API Design](#api-design)
6. [Testing Strategy](#testing-strategy)
7. [Security](#security)
8. [Performance](#performance)
9. [Code Style](#code-style)
10. [Git Workflow](#git-workflow)

---

## 🎯 Principes Fondamentaux

### 1. Type Safety First

**TOUJOURS** privilégier le typage fort :

```typescript
// ✅ BON - Type alias
type User = {
  id: number;
  name: string;
  email: string;
};

// ❌ ÉVITER - Interface
interface User {
  id: number;
  name: string;
}
```

**Règle : Utiliser `type` au lieu d'`interface` dans tout le projet.**

### 2. No External HTTP Libraries

**JAMAIS** utiliser axios, got, request, etc.

```typescript
// ✅ BON - Native fetch
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// ❌ ÉVITER - Axios
const response = await axios.post(url, data);
```

### 3. Server-First Architecture

Privilégier Server Components et Server Actions :

```typescript
// ✅ BON - Server Component
export default async function ProductsPage() {
  const products = await getProducts(); // Fetch direct server-side
  return <ProductList products={products} />;
}

// ❌ ÉVITER - Client Component inutile
'use client';
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { /* fetch */ }, []);
  return <ProductList products={products} />;
}
```

### 4. Composition Over Inheritance

```typescript
// ✅ BON - Composition
type BaseEntity = {
  id: number;
  created_at: string;
};

type Product = BaseEntity & {
  name: string;
  price: number;
};

// ❌ ÉVITER - Inheritance avec interface
interface BaseEntity {
  id: number;
}
interface Product extends BaseEntity {
  name: string;
}
```

---

## 🐘 Laravel Best Practices

### 1. Structure des Controllers

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // 1. Validation
        $validated = $request->validate([
            'category' => 'sometimes|string|max:100',
            'sort' => 'sometimes|in:name,price',
        ]);

        // 2. Business Logic (idéalement dans un Service)
        $products = Product::query()
            ->when($validated['category'] ?? null, function ($query, $category) {
                return $query->where('category', $category);
            })
            ->get();

        // 3. Response
        return response()->json([
            'products' => $products,
            'total' => $products->count(),
        ]);
    }
}
```

**Règles :**
- ✅ Validation en premier
- ✅ Utiliser les Form Requests pour validation complexe
- ✅ Typage de retour explicite (`: JsonResponse`)
- ✅ Extraire la logique métier dans des Services si complexe
- ✅ Retourner toujours un format JSON cohérent

### 2. Models Eloquent

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'total',
        'status',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'total' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    /**
     * Get the order items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        return 'ORD-' . strtoupper(uniqid());
    }
}
```

**Règles :**
- ✅ Toujours définir `$fillable` ou `$guarded`
- ✅ Utiliser `$casts` pour les types
- ✅ Typer les relations (`: HasMany`, `: BelongsTo`)
- ✅ Méthodes métier dans le modèle si simple
- ✅ Accessors/Mutators avec les nouveaux attributs Laravel 10

### 3. Middleware

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class QueueMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $sessionId = $request->header('X-Session-Id');

        // 1. Validation
        if (!$sessionId) {
            return response()->json([
                'error' => 'Session ID required',
            ], 400);
        }

        // 2. Business Logic
        if ($this->isUserActive($sessionId)) {
            $this->refreshSession($sessionId);
            return $next($request);
        }

        // 3. Queue Logic
        if ($this->canActivate()) {
            $this->activateUser($sessionId);
            return $next($request);
        }

        // 4. Return Queue Response
        return response()->json([
            'queued' => true,
            'position' => $this->getPosition($sessionId),
        ], 429);
    }

    private function isUserActive(string $sessionId): bool
    {
        return Redis::sismember('queue:active_users', $sessionId);
    }

    // ... autres méthodes privées
}
```

**Règles :**
- ✅ Logique claire et séparée
- ✅ Méthodes privées pour extraction
- ✅ Retours JSON cohérents
- ✅ Status codes HTTP appropriés

### 4. Validation avec Form Requests

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ou logique d'autorisation
    }

    public function rules(): array
    {
        return [
            'customer_name' => 'required|string|min:2|max:100',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|regex:/^\+?[1-9]\d{1,14}$/',
            'shipping_address' => 'required|string|min:5|max:255',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_email.email' => 'Please provide a valid email address.',
            'items.required' => 'At least one item is required.',
        ];
    }
}
```

**Règles :**
- ✅ Toujours utiliser Form Requests pour validation complexe
- ✅ Messages personnalisés
- ✅ Typage des méthodes
- ✅ Validation profonde pour les arrays

---

## ⚛️ Next.js 16 Best Practices

### 1. Structure des Composants

**Server Component (par défaut) :**

```typescript
// app/products/page.tsx
import { getProducts } from '@/app/actions/product';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
}
```

**Client Component (quand nécessaire) :**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type CartButtonProps = {
  productId: number;
  onAdd: (id: number) => void;
};

export function CartButton({ productId, onAdd }: CartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      onClick={() => onAdd(productId)}
      disabled={isLoading}
    >
      Add to Cart
    </Button>
  );
}
```

**Règles :**
- ✅ Server Component par défaut
- ✅ Client Component UNIQUEMENT si hooks/interactivité nécessaires
- ✅ Props typées avec `type`, jamais `interface`
- ✅ Nommer les types avec le suffixe `Props`

### 2. Server Actions

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations/checkout';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

export async function createOrderAction(
  formData: CheckoutFormData,
  sessionId: string
): Promise<ActionResult<Order>> {
  try {
    // 1. Validation Zod
    const validated = checkoutSchema.parse(formData);

    // 2. API Call
    const { order } = await apiClient.createOrder(validated, sessionId);

    // 3. Revalidation
    revalidatePath('/orders');
    revalidatePath('/cart');

    return { success: true, data: order };
  } catch (error) {
    // 4. Error Handling
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: 'Validation failed',
        errors: formatZodErrors(error),
      };
    }

    return {
      success: false,
      error: error.message || 'An error occurred',
    };
  }
}
```

**Règles :**
- ✅ Directive `'use server'` en première ligne
- ✅ Validation côté serveur TOUJOURS
- ✅ Type de retour explicite `ActionResult<T>`
- ✅ Revalidation des paths/tags après mutation
- ✅ Gestion d'erreurs complète

### 3. Data Fetching avec fetch

```typescript
// Server Component
export async function getProducts(category?: string) {
  const url = new URL(`${process.env.API_URL}/api/products`);
  if (category) url.searchParams.set('category', category);

  const response = await fetch(url, {
    cache: 'force-cache',  // Cache permanent
    next: {
      revalidate: 3600,    // Revalider après 1h
      tags: ['products'],  // Tag pour invalidation
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

// Invalidation depuis une Server Action
import { revalidateTag } from 'next/cache';

export async function createProductAction(data) {
  // ... create product
  revalidateTag('products'); // Invalide TOUTES les requêtes avec ce tag
  return { success: true };
}
```

**Règles :**
- ✅ Utiliser les options de cache Next.js 16
- ✅ `cache: 'force-cache'` pour données statiques
- ✅ `cache: 'no-store'` pour données dynamiques
- ✅ `revalidate: number` pour revalidation temporelle
- ✅ `tags: string[]` pour invalidation granulaire

### 4. TanStack Query (Client-side)

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const { products } = await apiClient.getProducts({ category });
      return products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateOrder(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const { order } = await apiClient.createOrder(data, sessionId);
      return order;
    },
    onSuccess: (order) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Toast notification
      toast.success('Order created!', {
        description: `Order #${order.order_number}`,
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

**Règles :**
- ✅ Query keys arrays pour invalidation ciblée
- ✅ `staleTime` pour contrôle du cache
- ✅ Invalidation des queries dans `onSuccess`
- ✅ Toast notifications dans mutations
- ✅ Types explicites pour mutations

### 5. Form Validation avec Zod + RHF

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Schema Zod
const checkoutSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  items: z.array(z.object({
    product_id: z.number().positive(),
    quantity: z.number().positive().max(100),
  })).min(1),
});

// 2. Type inference
type CheckoutFormData = z.infer<typeof checkoutSchema>;

// 3. Component
export function CheckoutForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    // Submit to Server Action
    const result = await createOrderAction(data, sessionId);

    if (result.success) {
      toast.success('Order created!');
      router.push('/confirmation');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('customer_name')} />
      {errors.customer_name && (
        <p className="text-red-500">{errors.customer_name.message}</p>
      )}
      {/* ... */}
    </form>
  );
}
```

**Règles :**
- ✅ Schéma Zod réutilisable (client + server)
- ✅ Type inference avec `z.infer<typeof schema>`
- ✅ `zodResolver` pour intégration RHF
- ✅ Messages d'erreur affichés
- ✅ Server Action pour soumission

---

## 📘 TypeScript Conventions

### 1. Type vs Interface

**TOUJOURS utiliser `type`, JAMAIS `interface` :**

```typescript
// ✅ BON
type User = {
  id: number;
  name: string;
  email: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

// ❌ ÉVITER
interface User {
  id: number;
  name: string;
}
```

**Raisons :**
- Cohérence dans tout le projet
- `type` peut tout faire (unions, intersections, etc.)
- `type` plus flexible avec les génériques
- Convention moderne TypeScript

### 2. Unions et Intersections

```typescript
// Unions
type Status = 'pending' | 'processing' | 'completed' | 'failed';

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Intersections
type BaseEntity = {
  id: number;
  created_at: string;
};

type Product = BaseEntity & {
  name: string;
  price: number;
};

type OrderWithItems = Order & {
  items: OrderItem[];
};
```

### 3. Génériques

```typescript
type ApiClient = {
  get: <T>(url: string) => Promise<T>;
  post: <T, D = any>(url: string, data: D) => Promise<T>;
};

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  per_page: number;
  total: number;
};

// Usage
const products: PaginatedResponse<Product> = await api.get('/products');
```

### 4. Utility Types

```typescript
// Partial - Tous les champs optionnels
type UpdateUserData = Partial<User>;

// Pick - Sélectionner certains champs
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit - Exclure certains champs
type CreateUserData = Omit<User, 'id' | 'created_at'>;

// Record - Objet avec clés typées
type UserMap = Record<number, User>;
```

### 5. Type Guards

```typescript
type ApiError = {
  message: string;
  status?: number;
};

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}

// Usage
try {
  await apiClient.getProducts();
} catch (error) {
  if (isApiError(error)) {
    console.error(error.message, error.status);
  }
}
```

---

## 🔌 API Design

### 1. RESTful Conventions

```
GET    /api/products          # Liste
GET    /api/products/:id      # Détail
POST   /api/products          # Créer
PUT    /api/products/:id      # Mettre à jour (complet)
PATCH  /api/products/:id      # Mettre à jour (partiel)
DELETE /api/products/:id      # Supprimer
```

### 2. Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z"
  }
}

// Error Response
{
  "success": false,
  "error": "Resource not found",
  "errors": {
    "email": ["Email is already taken"]
  },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z"
  }
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  }
}
```

### 3. Status Codes

```typescript
200 OK              // GET, PUT, PATCH success
201 Created         // POST success
204 No Content      // DELETE success
400 Bad Request     // Validation error
401 Unauthorized    // Authentication required
403 Forbidden       // Permission denied
404 Not Found       // Resource not found
429 Too Many Requests // Rate limit / Queue
500 Internal Error  // Server error
```

---

## 🧪 Testing Strategy

### Backend (Laravel)

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;

class ProductControllerTest extends TestCase
{
    public function test_can_list_products(): void
    {
        Product::factory()->count(5)->create();

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'products' => [
                    '*' => ['id', 'name', 'price', 'stock']
                ]
            ])
            ->assertJsonCount(5, 'products');
    }

    public function test_can_filter_products_by_category(): void
    {
        Product::factory()->create(['category' => 'electronics']);
        Product::factory()->create(['category' => 'clothing']);

        $response = $this->getJson('/api/products?category=electronics');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'products');
    }
}
```

### Frontend (Next.js)

```typescript
// __tests__/hooks/use-products.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '@/hooks/use-products';

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(15);
  });

  it('handles errors gracefully', async () => {
    // Mock API error
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
```

---

## 🔒 Security

### 1. Input Validation

```php
// Laravel
$request->validate([
    'email' => 'required|email|max:255',
    'password' => 'required|min:8|confirmed',
]);
```

```typescript
// Next.js
const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8),
});
```

### 2. CSRF Protection

Laravel CSRF automatique pour forms, Next.js Server Actions sécurisés par défaut.

### 3. SQL Injection Prevention

```php
// ✅ BON - Eloquent
Product::where('category', $category)->get();

// ✅ BON - Query Builder avec bindings
DB::select('SELECT * FROM products WHERE category = ?', [$category]);

// ❌ ÉVITER - Raw SQL sans bindings
DB::select("SELECT * FROM products WHERE category = '$category'");
```

### 4. XSS Prevention

```tsx
// ✅ BON - React échappe automatiquement
<div>{userInput}</div>

// ⚠️ ATTENTION - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: sanitize(userInput) }} />
```

---

## ⚡ Performance

### 1. Database Query Optimization

```php
// ✅ BON - Eager loading
$orders = Order::with('items')->get();

// ❌ ÉVITER - N+1 queries
$orders = Order::all();
foreach ($orders as $order) {
    $order->items; // Query par ordre !
}
```

### 2. Caching

```php
// Laravel
$products = Cache::remember('products', 3600, function () {
    return Product::all();
});
```

```typescript
// Next.js 16
const products = await fetch('/api/products', {
  cache: 'force-cache',
  next: { revalidate: 3600 },
});
```

### 3. Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product"
  width={500}
  height={300}
  priority // Pour LCP
/>
```

---

## 🎨 Code Style

### PHP (Laravel)

- PSR-12 Standard
- Camel case pour méthodes
- Snake case pour propriétés DB
- Type hints toujours

### TypeScript (Next.js)

- ESLint + Prettier
- Camel case pour variables/fonctions
- Pascal case pour composants/types
- `type` au lieu d'`interface`

---

## 🌿 Git Workflow

### Commit Messages

```
feat: Add product filtering by category
fix: Resolve queue position calculation bug
refactor: Extract validation logic to Form Request
docs: Update API documentation
style: Format code with Prettier
test: Add tests for order creation
perf: Optimize database queries with eager loading
chore: Update dependencies
```

### Branch Naming

```
claude/feature-name
claude/fix-bug-description
claude/refactor-component-name
```

---

## ✅ Checklist Before Commit

- [ ] Types TypeScript corrects (NO `any`, NO `interface`)
- [ ] Validation côté client ET serveur
- [ ] Gestion d'erreurs complète
- [ ] Pas d'import axios ou autre HTTP lib
- [ ] Server Components privilégiés
- [ ] Cache strategy définie
- [ ] Tests écrits (si feature importante)
- [ ] Code formaté (Prettier)
- [ ] Pas de console.log en prod

---

## 📚 Ressources

- [Laravel Documentation](https://laravel.com/docs/10.x)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)

---

## 🎯 Conclusion

Ce guide définit les standards de développement pour ce projet. **Tous les nouveaux codes doivent suivre ces conventions.**

En cas de doute :
1. Consulter ce guide
2. Vérifier le code existant
3. Privilégier la simplicité et la lisibilité
4. Type safety > flexibilité
