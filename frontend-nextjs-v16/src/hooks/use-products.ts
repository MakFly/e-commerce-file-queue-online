'use client';

/**
 * Products Hooks
 *
 * Custom hooks for product data fetching with TanStack Query
 */

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { apiClient, type Product } from '@/lib/api-client';

/**
 * Hook to fetch all products
 */
export function useProducts(params?: { category?: string; sessionId?: string }) {
  return useQuery({
    queryKey: queryKeys.products.list(params?.category ? { category: params.category } : undefined),
    queryFn: async () => {
      const response = await apiClient.getProducts(params);
      return response.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all products with Suspense
 * Use this with React Suspense boundary
 */
export function useProductsSuspense(params?: { category?: string; sessionId?: string }) {
  return useSuspenseQuery({
    queryKey: queryKeys.products.list(params?.category ? { category: params.category } : undefined),
    queryFn: async () => {
      const response = await apiClient.getProducts(params);
      return response.products;
    },
  });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(id: number, sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      const response = await apiClient.getProduct(id, sessionId);
      return response.product;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to prefetch products
 * Use this to preload data before navigation
 */
export function usePrefetchProducts() {
  const queryClient = useQuery({
    queryKey: ['prefetch'],
    queryFn: () => null,
  });

  return {
    prefetchProducts: async (category?: string) => {
      // This would need access to queryClient
      // Typically used in router prefetch
    },
  };
}
