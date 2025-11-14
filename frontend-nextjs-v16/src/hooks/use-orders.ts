'use client';

/**
 * Orders Hooks
 *
 * Custom hooks for order data fetching and mutations with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { apiClient, type CreateOrderData, type Order } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Hook to fetch user orders
 */
export function useOrders(sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.list(sessionId),
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.getOrders(sessionId);
      return response.orders;
    },
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId: number, sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.getOrder(orderId, sessionId);
      return response.order;
    },
    enabled: !!orderId && !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new order
 */
export function useCreateOrder(sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.createOrder(data, sessionId);
      return response.order;
    },
    onSuccess: (data) => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });

      // Show success toast
      toast.success('Order created successfully!', {
        description: `Order #${data.order_number} has been placed.`,
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error('Failed to create order', {
        description: error.response?.data?.message || error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Hook to get order statistics (client-side computed)
 */
export function useOrderStats(sessionId?: string) {
  const { data: orders, isLoading } = useOrders(sessionId);

  if (isLoading || !orders) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      completedOrders: 0,
    };
  }

  const stats = orders.reduce(
    (acc, order) => {
      acc.totalOrders++;
      acc.totalSpent += order.total;
      if (order.status === 'pending' || order.status === 'processing') {
        acc.pendingOrders++;
      }
      if (order.status === 'delivered') {
        acc.completedOrders++;
      }
      return acc;
    },
    {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      completedOrders: 0,
    }
  );

  return stats;
}
