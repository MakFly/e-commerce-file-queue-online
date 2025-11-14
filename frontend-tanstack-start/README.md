# Frontend TanStack Start - E-Commerce with Queue System

🚧 **Work in Progress** - TanStack Start Alternative to Next.js Frontend

## 📋 Overview

This is an alternative frontend implementation using **TanStack Start** (v1), the new full-stack React framework that serves as a modern alternative to Next.js. It aims to provide the same functionality as `frontend-nextjs-v16` but leveraging the TanStack ecosystem.

### Why TanStack Start?

- **Full-stack type safety** with TanStack Router
- **Built-in data fetching** with TanStack Query
- **Server functions** similar to Next.js Server Actions
- **Streaming SSR** out of the box
- **Universal deployment** (Node, Cloudflare Workers, etc.)
- **File-based routing** with TanStack Router
- **DevTools** integrated for Router and Query

## 🏗️ Architecture

### Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **TanStack Start** | ^1.80 | Full-stack framework |
| **TanStack Router** | ^1.80 | File-based routing |
| **TanStack Query** | ^5.62 | Data fetching & caching |
| **React** | 19.0 | UI library |
| **TypeScript** | 5.7 | Type safety |
| **Tailwind CSS** | 3.4 | Styling |
| **Radix UI** | Latest | UI components (shadcn/ui compatible) |
| **Vinxi** | ^0.4 | Build tool & bundler |
| **Zod** | 3.24 | Schema validation |

### Project Structure

```
frontend-tanstack-start/
├── app/
│   ├── routes/
│   │   ├── __root.tsx          # Root layout with TanStack Router outlet
│   │   ├── index.tsx            # Home page with queue system
│   │   ├── login.tsx            # Authentication page
│   │   ├── admin.tsx            # Admin dashboard
│   │   ├── shop.tsx             # Product listing
│   │   ├── cart.tsx             # Shopping cart
│   │   └── orders.tsx           # Order history
│   ├── components/
│   │   ├── ui/                  # Radix UI components (shadcn/ui style)
│   │   ├── QueueWaitingRoom.tsx # Queue waiting room component
│   │   └── Navbar.tsx           # Navigation component
│   ├── lib/
│   │   ├── api.ts               # API client with native fetch
│   │   ├── utils.ts             # Utility functions
│   │   └── query-client.ts      # TanStack Query configuration
│   ├── hooks/
│   │   ├── useQueue.ts          # Queue management hook
│   │   └── useAuth.ts           # Authentication hook
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── client.tsx               # Client entry point
│   ├── ssr.tsx                  # SSR entry point
│   └── router.tsx               # Router configuration
├── app.config.ts                # TanStack Start configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🔄 TanStack Start vs Next.js

### Key Differences

| Feature | Next.js 16 | TanStack Start |
|---------|-----------|----------------|
| Routing | App Router | TanStack Router (file-based) |
| Data Fetching | fetch with cache | TanStack Query |
| Server Actions | `use server` | Server functions |
| Bundler | Turbopack | Vinxi (Vite-based) |
| SSR | Built-in | Built-in |
| Streaming | Built-in | Built-in |
| Compiler | React Compiler | None (uses standard React) |

### Migration from Next.js

#### Routing

**Next.js:**
```typescript
// app/page.tsx
export default function Page() {
  return <div>Home</div>
}
```

**TanStack Start:**
```typescript
// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <div>Home</div>
}
```

#### Data Fetching

**Next.js:**
```typescript
async function getData() {
  const res = await fetch('http://localhost:8000/api/products')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data}</div>
}
```

**TanStack Start:**
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/products')
      return res.json()
    },
  })

  return <div>{data}</div>
}
```

#### Server Functions

**Next.js Server Actions:**
```typescript
'use server'

export async function createOrder(formData: FormData) {
  // Server-side logic
}
```

**TanStack Start Server Functions:**
```typescript
import { createServerFn } from '@tanstack/start'

export const createOrder = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    // Server-side logic
  })
```

## 📦 Features to Implement

This is a starter project. The following features need to be implemented based on `frontend-nextjs-v16`:

### Core Features
- [ ] Queue System Integration
  - [ ] `useQueue` hook with TanStack Query
  - [ ] QueueWaitingRoom component
  - [ ] Session management with UUID
  - [ ] Heartbeat mechanism
  - [ ] Auto-refresh position

- [ ] Authentication System
  - [ ] Login/Register pages
  - [ ] JWT + Refresh Token management
  - [ ] Protected routes with TanStack Router
  - [ ] Auth context/hooks

- [ ] E-Commerce Features
  - [ ] Product listing with TanStack Query
  - [ ] Shopping cart context
  - [ ] Checkout flow
  - [ ] Order management

- [ ] Admin Dashboard
  - [ ] Real-time statistics
  - [ ] User management
  - [ ] Queue control
  - [ ] Charts and analytics

### UI Components
- [ ] Radix UI components (Button, Card, Input, etc.)
- [ ] Navigation component
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications (Sonner)

## 🛠️ Development

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME="E-Commerce Platform"
```

### Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### TanStack DevTools

TanStack Start comes with integrated DevTools for both Router and Query:

```typescript
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <YourApp />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  )
}
```

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

Add to `docker-compose.yml`:

```yaml
frontend-tanstack-start:
  build:
    context: ./frontend-tanstack-start
    dockerfile: Dockerfile
  container_name: ecommerce_frontend_tanstack
  ports:
    - "3002:3000"
  environment:
    - NODE_ENV=development
    - VITE_API_URL=http://localhost:8000
  depends_on:
    - backend-laravel
  networks:
    - ecommerce_network
  command: npm run dev
```

## 📚 Resources

### Official Documentation
- [TanStack Start Docs](https://tanstack.com/start/latest)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [TanStack Query Docs](https://tanstack.com/query/latest)

### Tutorials
- [Getting Started with TanStack Start](https://tanstack.com/start/latest/docs/framework/react/getting-started)
- [TanStack Start with shadcn/ui](https://ui.shadcn.com/docs/installation/tanstack)
- [Full-Stack App with TanStack Start](https://blog.logrocket.com/full-stack-app-with-tanstack-start/)

### Community
- [TanStack Discord](https://tlinz.com/discord)
- [GitHub Discussions](https://github.com/TanStack/router/discussions)

## 🤝 Contributing

To contribute to this TanStack Start implementation:

1. Refer to `frontend-nextjs-v16` for feature parity
2. Follow TanStack Start best practices
3. Maintain type safety with TypeScript
4. Use TanStack Query for all data fetching
5. Keep components modular and reusable

## ⚡ Performance

TanStack Start offers excellent performance out of the box:

- **Fast bundling** with Vinxi (Vite-based)
- **Streaming SSR** for instant page loads
- **Automatic code splitting** by route
- **Optimized queries** with TanStack Query caching
- **Built-in prefetching** for navigation

## 🔐 Security

Same security practices as Next.js frontend:
- CORS configuration
- JWT authentication
- Refresh token rotation
- Input validation with Zod
- XSS protection

## 📝 License

MIT

---

**Note**: This is a work-in-progress alternative to the fully-featured `frontend-nextjs-v16`. Both frontends can coexist in the project and connect to the same Laravel/Symfony backends.

**Current Status**: 🏗️ Project structure created, implementation in progress
