/**
 * TanStack Query Configuration
 *
 * This module configures React Query for optimal performance and developer experience.
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    // Refetch on window focus only if data is stale
    refetchOnWindowFocus: false,
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
    // Retry failed requests 1 time
    retry: 1,
    // Stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: 10 minutes
    gcTime: 10 * 60 * 1000,
  },
  mutations: {
    // Retry failed mutations 0 times
    retry: 0,
  },
};

/**
 * Create a new QueryClient instance
 * Use this in app router for per-request query client
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

/**
 * Global query client instance
 * Use this for client-side only
 */
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Query Keys Factory
 * Centralized query keys for consistency and type safety
 */
export const queryKeys = {
  // Queue
  queue: {
    all: ['queue'] as const,
    status: (sessionId: string) => [...queryKeys.queue.all, 'status', sessionId] as const,
    stats: () => [...queryKeys.queue.all, 'stats'] as const,
  },
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: { category?: string }) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
  },
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (sessionId?: string) => [...queryKeys.orders.lists(), sessionId] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
  },
  // Admin
  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
  },
} as const;
