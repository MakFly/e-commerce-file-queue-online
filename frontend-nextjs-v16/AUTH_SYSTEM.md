# 🔐 Système d'Authentification avec Refresh Token

## 📋 Vue d'Ensemble

Ce système d'authentification suit les **meilleures pratiques Next.js App Router** avec :
- ✅ **iron-session** pour la gestion de session sécurisée
- ✅ **Server Actions** pour toute la logique d'authentification
- ✅ **DAL (Data Access Layer)** comme couche de sécurité principale
- ✅ **Middleware** pour la validation initiale (pas la seule défense)
- ✅ **Refresh Token** automatique et transparent
- ✅ **Type-safe** avec TypeScript

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ AuthProvider │  │ useAuth()    │  │ Login/Register   │  │
│  │ (Context)    │  │ Hooks        │  │ Forms            │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                  │                    │            │
└─────────┼──────────────────┼────────────────────┼────────────┘
          │                  │                    │
          ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER ACTIONS                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ login()    │  │ logout()   │  │ refreshAccessToken() │  │
│  └─────┬──────┘  └─────┬──────┘  └──────────┬───────────┘  │
│        │               │                     │              │
│        └───────────────┼─────────────────────┘              │
│                        ▼                                     │
│        ┌───────────────────────────────┐                    │
│        │     Session Management        │                    │
│        │     (iron-session)            │                    │
│        │  • createSession()            │                    │
│        │  • updateSessionToken()       │                    │
│        │  • destroySession()           │                    │
│        └───────────────┬───────────────┘                    │
└────────────────────────┼────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
┌──────────────┐  ┌───────────┐  ┌──────────────┐
│  Middleware  │  │    DAL    │  │   Backend    │
│  (Initial    │  │ (Security │  │   Laravel    │
│   Check)     │  │  Layer)   │  │   API        │
└──────────────┘  └───────────┘  └──────────────┘
```

---

## 📁 Structure des Fichiers

```
frontend/src/
├── types/
│   └── auth.ts                          # Types d'authentification
├── lib/
│   ├── auth/
│   │   ├── session.ts                   # Gestion de session (iron-session)
│   │   └── dal.ts                       # Data Access Layer (sécurité)
│   └── constants.ts                     # AUTH_ENDPOINTS
├── app/
│   ├── actions/
│   │   └── auth.ts                      # Server Actions (login, logout, refresh)
│   ├── api/
│   │   └── auth/
│   │       └── user/
│   │           └── route.ts             # GET /api/auth/user
│   └── proxy.ts                    # Proxy Next.js
├── hooks/
│   └── useAuth.ts                       # Hooks React pour auth
└── components/
    └── providers/
        └── auth-provider.tsx            # Provider React
```

---

## 🔑 Concepts Clés

### 1. **Session Management (iron-session)**

Les sessions sont stockées dans des **cookies signés et chiffrés**.

**Configuration** (`lib/auth/session.ts`) :
```typescript
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET, // Min 32 caractères
  cookieName: 'auth_session',
  cookieOptions: {
    secure: true,      // HTTPS only en production
    httpOnly: true,    // Pas accessible via JavaScript
    sameSite: 'lax',   // Protection CSRF
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
};
```

**Fonctions disponibles** :
```typescript
import { getSession, createSession, destroySession } from '@/lib/auth/session';

// Créer une session
await createSession({
  user,
  accessToken,
  refreshToken,
  expiresAt,
  issuedAt,
});

// Récupérer la session
const session = await getSession();
console.log(session.user, session.accessToken);

// Détruire la session
await destroySession();
```

---

### 2. **DAL (Data Access Layer)**

**Couche de sécurité PRINCIPALE** - Ne jamais se fier uniquement au middleware !

**Utilisation dans Server Components** :
```typescript
import { verifySession, getAuthUser, requireAdmin } from '@/lib/auth/dal';

export default async function DashboardPage() {
  // Vérifier l'authentification
  const { isAuth, user } = await verifySession();

  if (!isAuth) {
    redirect('/login');
  }

  return <div>Hello {user.name}</div>;
}
```

**Utilisation dans Server Actions** :
```typescript
'use server';

import { getAuthUser } from '@/lib/auth/dal';

export async function updateProfile(data: ProfileData) {
  // Vérifier TOUJOURS l'auth dans les Server Actions
  const user = await getAuthUser(); // Throw si non auth

  // Votre logique...
}
```

**Utilisation dans Route Handlers** :
```typescript
import { getAccessToken } from '@/lib/auth/dal';

export async function GET() {
  try {
    const token = await getAccessToken();

    // Faire un appel API avec le token
    const response = await fetch(`${API_URL}/data`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

---

### 3. **Server Actions**

Toute la logique d'authentification utilise des **Server Actions** :

#### Login
```typescript
'use client';

import { login } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

function LoginForm() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (result.success) {
      router.push('/dashboard');
      router.refresh(); // Refresh Server Components
    } else {
      alert(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

#### Logout
```typescript
'use client';

import { logout } from '@/app/actions/auth';

function LogoutButton() {
  return (
    <button onClick={() => logout()}>
      Logout
    </button>
  );
}
```

#### Auto-refresh
Le refresh est **automatique** via le `AuthProvider` :
- Refresh toutes les 5 minutes
- Refresh au focus de la fenêtre
- Refresh manuel via `refreshUser()`

---

### 4. **Middleware**

**Validation initiale uniquement** - Pas la seule défense !

Le middleware :
- ✅ Redirige vers /login si pas de session
- ✅ Empêche les users auth d'accéder à /login
- ✅ Protège les routes admin
- ❌ N'EST PAS suffisant seul (toujours vérifier dans le DAL)

```typescript
// proxy.ts
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/orders'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/login', '/register'];
```

---

## 🚀 Guide d'Utilisation

### Configuration Initiale

**1. Variables d'environnement** (`.env.local`) :
```bash
# Session secret (MIN 32 caractères, généré aléatoirement)
SESSION_SECRET="your-super-secret-session-key-min-32-chars"

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**2. Générer un SESSION_SECRET** :
```bash
openssl rand -base64 32
```

---

### Intégration dans le Root Layout

**`app/layout.tsx`** :
```typescript
import { AuthProvider } from '@/components/providers/auth-provider';
import { verifySession } from '@/lib/auth/dal';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await verifySession();

  return (
    <html lang="fr">
      <body>
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Protéger une Page (Server Component)

**`app/dashboard/page.tsx`** :
```typescript
import { verifySession } from '@/lib/auth/dal';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { isAuth, user } = await verifySession();

  if (!isAuth) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hello {user.name} ({user.email})</p>
    </div>
  );
}
```

---

### Protéger une Page (Client Component)

**`app/profile/page.tsx`** :
```typescript
'use client';

import { useRequireAuth, useUser } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { isLoading } = useRequireAuth(); // Auto-redirect si pas auth
  const user = useUser();

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>{user.name}</p>
    </div>
  );
}
```

---

### Page Admin Only

**`app/admin/page.tsx`** :
```typescript
import { requireAdmin } from '@/lib/auth/dal';

export default async function AdminPage() {
  const user = await requireAdmin(); // Throw si pas admin

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome Admin: {user.name}</p>
    </div>
  );
}
```

---

### Appeler l'API Backend avec le Token

**Server Component** :
```typescript
import { getAccessToken } from '@/lib/auth/dal';

export default async function ProductsPage() {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/api/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { products } = await response.json();

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

**Client Component** (via Route Handler) :
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ProductsClient() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products));
  }, []);

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

**Route Handler** (`app/api/products/route.ts`) :
```typescript
import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth/dal';

export async function GET() {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/api/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

---

## 🔄 Flux d'Authentification

### 1. Login Flow

```
1. User remplit le formulaire login
2. Client appelle login() Server Action
3. Server Action:
   - Valide les données (Zod)
   - Appelle backend API POST /api/auth/login
   - Reçoit { user, tokens }
   - Crée une session iron-session
4. Redirection vers /dashboard
5. Server Component vérifie la session (DAL)
6. User authentifié !
```

### 2. Access Token Refresh Flow

```
1. AuthProvider vérifie périodiquement (5 min)
2. Appelle checkAndRefreshToken() Server Action
3. Server Action:
   - Vérifie si le token a besoin d'un refresh (80% du temps)
   - Si oui, appelle backend POST /api/auth/refresh
   - Reçoit nouveau accessToken
   - Met à jour la session avec updateSessionToken()
4. User continue sans interruption
```

### 3. Logout Flow

```
1. User clique sur "Logout"
2. Client appelle logout() Server Action
3. Server Action:
   - Appelle backend POST /api/auth/logout
   - Détruit la session (destroySession())
   - Redirect vers /login
4. User déconnecté
```

---

## 🛡️ Sécurité

### Best Practices Implémentées

✅ **Session dans cookies httpOnly** - JavaScript ne peut pas y accéder
✅ **Cookies chiffrés avec iron-session** - Protection contre la manipulation
✅ **sameSite: 'lax'** - Protection CSRF
✅ **secure: true en production** - HTTPS only
✅ **DAL comme couche de sécurité principale** - Vérification systématique
✅ **Validation Zod** - Validation des inputs côté serveur
✅ **Auto-refresh transparent** - Pas de stockage token en localStorage
✅ **Server Actions only** - Pas d'appels API directs depuis le client

### Variables Sensibles

```bash
# .env.local (JAMAIS commiter)
SESSION_SECRET="..."

# .env.example (commiter celui-ci)
SESSION_SECRET="generate_with_openssl_rand_base64_32"
```

### Rotation des Secrets

En production, **changer le SESSION_SECRET** :
- Invalidera toutes les sessions existantes
- Force tous les users à se reconnecter
- À faire en maintenance planifiée

---

## 📊 Monitoring & Debugging

### Vérifier la Session (Server)

```typescript
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();

  console.log('Session:', {
    user: session.user,
    expiresAt: new Date(session.expiresAt),
    isExpired: Date.now() >= session.expiresAt,
  });

  return NextResponse.json({ session });
}
```

### Logs

```typescript
// Dans les Server Actions
console.log('[AUTH] Login attempt:', email);
console.log('[AUTH] Session created for user:', user.id);
console.log('[AUTH] Token refreshed:', new Date());
```

---

## 🧪 Testing

### Test d'Authentification

```typescript
// __tests__/auth.test.ts
import { login } from '@/app/actions/auth';

describe('Authentication', () => {
  it('should login successfully', async () => {
    const result = await login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  it('should fail with invalid credentials', async () => {
    const result = await login({
      email: 'invalid@example.com',
      password: 'wrong',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

## 🔧 Troubleshooting

### "Session expired" constant

**Cause** : SESSION_SECRET a changé ou cookies corrompus

**Solution** :
1. Vérifier SESSION_SECRET dans .env.local
2. Supprimer les cookies du browser
3. Redémarrer le serveur Next.js

### "Unauthorized" même après login

**Cause** : Middleware ou DAL bloque

**Debug** :
```typescript
// Dans proxy.ts
console.log('Session:', session);
console.log('Is authenticated:', isAuthenticated);
console.log('Token expired:', isTokenExpired);
```

### Auto-refresh ne fonctionne pas

**Cause** : Backend ne retourne pas le bon format

**Vérifier** :
```json
// Response de POST /api/auth/refresh
{
  "accessToken": "...",
  "expiresIn": 3600
}
```

---

## 📚 Références

- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [iron-session Documentation](https://github.com/vvo/iron-session)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Créé le** : 14 Novembre 2025
**Version** : 1.0.0
**Status** : ✅ Production Ready
