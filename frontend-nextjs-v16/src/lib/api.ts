/**
 * API Library - Native Fetch Implementation
 *
 * Legacy API wrapper using native fetch (NO axios)
 * This file maintains backward compatibility with existing code
 * while using the new fetch-based implementation
 */

import type {
  QueueStatus,
  AdminUser,
  AdminDashboard,
  AdminStats,
  HistoryData,
  RedisInfo,
  Product,
  CartItem,
  OrderItem,
  Order,
  CreateOrderData,
  PaymentData,
} from '@/types';

import { API_BASE_URL } from './constants';
import {
  buildUrl as buildUrlHelper,
  handleFetchResponse,
  createHeaders,
  fetchWithLogging,
} from './helpers';

// Re-export types for backward compatibility
export type {
  QueueStatus,
  AdminUser,
  AdminDashboard,
  AdminStats,
  HistoryData,
  RedisInfo,
  Product,
  CartItem,
  OrderItem,
  Order,
  CreateOrderData,
  PaymentData,
};

/**
 * Native fetch wrapper with error handling and logging
 */
async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()

  const headers = createHeaders(
    options.headers?.['X-Session-Id'] as string | undefined,
    options.headers
  );

  return fetchWithLogging<T>(method, url, {
    ...options,
    headers,
  });
}

/**
 * Helper to build URL with query params
 */
function buildUrl(path: string, params?: Record<string, any>): string {
  return buildUrlHelper(API_BASE_URL, path, params);
}

// ==================== Queue API ====================

export const queueApi = {
  checkStatus: async (sessionId: string): Promise<QueueStatus> => {
    return fetchWrapper<QueueStatus>(
      buildUrl('/api/queue/status', { session_id: sessionId }),
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },

  sendHeartbeat: async (sessionId: string) => {
    return fetchWrapper(
      buildUrl('/api/queue/heartbeat'),
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify({ session_id: sessionId }),
      }
    );
  },

  release: async (sessionId: string) => {
    return fetchWrapper(
      buildUrl('/api/queue/release'),
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify({ session_id: sessionId }),
      }
    );
  },

  getStats: async () => {
    return fetchWrapper(buildUrl('/api/queue/stats'));
  },
};

// ==================== Product API (Legacy) ====================

export const productApi = {
  getProducts: async (sessionId: string) => {
    return fetchWrapper(
      buildUrl('/api/products'),
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },
};

// ==================== Admin API ====================

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboard> => {
    return fetchWrapper<AdminDashboard>(buildUrl('/api/admin/dashboard'));
  },

  getStats: async (): Promise<AdminStats> => {
    return fetchWrapper<AdminStats>(buildUrl('/api/admin/stats'));
  },

  getHistory: async (minutes: number = 60): Promise<HistoryData[]> => {
    return fetchWrapper<HistoryData[]>(
      buildUrl('/api/admin/history', { minutes })
    );
  },

  kickUser: async (sessionId: string) => {
    return fetchWrapper(
      buildUrl('/api/admin/kick-user'),
      {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      }
    );
  },

  clearQueue: async () => {
    return fetchWrapper(
      buildUrl('/api/admin/clear-queue'),
      {
        method: 'POST',
      }
    );
  },

  updateConfig: async (config: { max_concurrent_users?: number; queue_enabled?: boolean }) => {
    return fetchWrapper(
      buildUrl('/api/admin/update-config'),
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  },

  getRedisInfo: async (): Promise<RedisInfo> => {
    return fetchWrapper<RedisInfo>(buildUrl('/api/admin/redis-info'));
  },
};

// ==================== E-commerce API ====================

export const ecommerceApi = {
  // Products
  getProducts: async (
    params?: {
      category?: string;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    },
    sessionId?: string
  ): Promise<{ products: Product[]; total: number }> => {
    return fetchWrapper<{ products: Product[]; total: number }>(
      buildUrl('/api/products', params),
      {
        headers: sessionId ? { 'X-Session-Id': sessionId } : {},
      }
    );
  },

  getProduct: async (id: number, sessionId?: string): Promise<Product> => {
    return fetchWrapper<Product>(
      buildUrl(`/api/products/${id}`),
      {
        headers: sessionId ? { 'X-Session-Id': sessionId } : {},
      }
    );
  },

  getCategories: async (sessionId?: string): Promise<string[]> => {
    return fetchWrapper<string[]>(
      buildUrl('/api/categories'),
      {
        headers: sessionId ? { 'X-Session-Id': sessionId } : {},
      }
    );
  },

  checkStock: async (
    items: { product_id: number; quantity: number }[],
    sessionId?: string
  ) => {
    return fetchWrapper(
      buildUrl('/api/products/check-stock'),
      {
        method: 'POST',
        headers: sessionId ? { 'X-Session-Id': sessionId } : {},
        body: JSON.stringify({ items }),
      }
    );
  },

  // Orders
  createOrder: async (
    orderData: CreateOrderData,
    sessionId: string
  ): Promise<{ success: boolean; message: string; order: Order }> => {
    return fetchWrapper<{ success: boolean; message: string; order: Order }>(
      buildUrl('/api/orders'),
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify(orderData),
      }
    );
  },

  getOrder: async (id: number, sessionId: string): Promise<Order> => {
    return fetchWrapper<Order>(
      buildUrl(`/api/orders/${id}`),
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },

  getOrderByNumber: async (orderNumber: string, sessionId: string): Promise<Order> => {
    return fetchWrapper<Order>(
      buildUrl(`/api/orders/number/${orderNumber}`),
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },

  processPayment: async (orderId: number, paymentData: PaymentData, sessionId: string) => {
    return fetchWrapper(
      buildUrl(`/api/orders/${orderId}/payment`),
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify(paymentData),
      }
    );
  },

  getUserOrders: async (sessionId: string): Promise<{ orders: Order[]; total: number }> => {
    return fetchWrapper<{ orders: Order[]; total: number }>(
      buildUrl('/api/my-orders'),
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },
};

/**
 * Legacy axios-style API export for backward compatibility
 * This is NOT axios, it's a native fetch wrapper
 */
export const api = {
  get: async <T>(url: string, config?: { params?: any; headers?: any }): Promise<{ data: T }> => {
    const fullUrl = buildUrl(url, config?.params);
    const data = await fetchWrapper<T>(fullUrl, {
      headers: config?.headers,
    });
    return { data };
  },

  post: async <T>(url: string, data?: any, config?: { headers?: any }): Promise<{ data: T }> => {
    const responseData = await fetchWrapper<T>(buildUrl(url), {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: config?.headers,
    });
    return { data: responseData };
  },
};
