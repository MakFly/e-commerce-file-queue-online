/**
 * API Client - Native Fetch Implementation (SSR/CSR Compatible)
 *
 * Modern API client using native fetch API for Next.js 16
 * Fully compatible with Server Components and Client Components
 * NO external HTTP libraries - pure fetch API
 */

import type {
  ApiError,
  Product,
  Order,
  OrderItem,
  CreateOrderData,
  QueueStatus,
  QueueStats,
} from '@/types';

import { API_BASE_URL } from './constants';
import {
  getSessionId,
  buildUrl,
  fetchApi as fetchHelper,
  handleApiError as handleError,
  get,
  post,
} from './helpers';

// Re-export types for backward compatibility
export type {
  ApiError,
  Product,
  Order,
  OrderItem,
  CreateOrderData,
  QueueStatus,
  QueueStats,
};

// Re-export helper functions
export { handleApiError: handleError } from './helpers';

/**
 * API Client Class
 */
class ApiClient {
  // ==================== Queue API ====================

  async getQueueStatus(sessionId: string): Promise<QueueStatus> {
    return get<QueueStatus>(
      API_BASE_URL,
      '/api/queue/status',
      {
        sessionId,
        params: { session_id: sessionId },
      }
    );
  }

  async sendHeartbeat(sessionId: string): Promise<{ status: string }> {
    return post<{ status: string }>(
      API_BASE_URL,
      '/api/queue/heartbeat',
      { session_id: sessionId },
      { sessionId }
    );
  }

  async releaseSession(sessionId: string): Promise<{ status: string }> {
    return post<{ status: string }>(
      API_BASE_URL,
      '/api/queue/release',
      { session_id: sessionId },
      { sessionId }
    );
  }

  async getQueueStats(): Promise<QueueStats> {
    return get<QueueStats>(API_BASE_URL, '/api/queue/stats');
  }

  // ==================== Products API ====================

  async getProducts(params?: {
    category?: string;
    sessionId?: string;
  }): Promise<{ products: Product[] }> {
    return get<{ products: Product[] }>(
      API_BASE_URL,
      '/api/products',
      {
        sessionId: params?.sessionId,
        params: params?.category ? { category: params.category } : undefined,
      }
    );
  }

  async getProduct(id: number, sessionId?: string): Promise<{ product: Product }> {
    return get<{ product: Product }>(
      API_BASE_URL,
      `/api/products/${id}`,
      { sessionId }
    );
  }

  // ==================== Orders API ====================

  async createOrder(data: CreateOrderData, sessionId?: string): Promise<{ order: Order }> {
    return post<{ order: Order }>(
      API_BASE_URL,
      '/api/orders',
      data,
      { sessionId }
    );
  }

  async getOrders(sessionId?: string): Promise<{ orders: Order[] }> {
    return get<{ orders: Order[] }>(
      API_BASE_URL,
      '/api/orders',
      { sessionId }
    );
  }

  async getOrder(id: number, sessionId?: string): Promise<{ order: Order }> {
    return get<{ order: Order }>(
      API_BASE_URL,
      `/api/orders/${id}`,
      { sessionId }
    );
  }

  // ==================== Admin API ====================

  async getAdminDashboard(): Promise<any> {
    return get<any>(API_BASE_URL, '/api/admin/dashboard');
  }

  async kickUser(sessionId: string): Promise<{ message: string }> {
    return post<{ message: string }>(
      API_BASE_URL,
      '/api/admin/kick-user',
      { session_id: sessionId }
    );
  }

  async clearQueue(): Promise<{ message: string }> {
    return post<{ message: string }>(
      API_BASE_URL,
      '/api/admin/clear-queue'
    );
  }

  async updateQueueConfig(config: {
    max_concurrent_users?: number;
    queue_enabled?: boolean;
  }): Promise<{ message: string; config: any }> {
    return post<{ message: string; config: any }>(
      API_BASE_URL,
      '/api/admin/update-config',
      config
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Server-side fetch helper
 * Use this in Server Components and Server Actions
 *
 * Next.js 16 Features:
 * - Cache control with 'no-store', 'force-cache', 'default'
 * - Revalidate with time-based or tag-based revalidation
 * - Tags for granular cache invalidation
 */
export async function serverFetch<T>(
  endpoint: string,
  options: {
    method?: string;
    sessionId?: string;
    body?: any;
    params?: Record<string, string | number | boolean | undefined | null>;
    // Next.js 16 cache options
    cache?: RequestCache;
    revalidate?: number | false;
    tags?: string[];
  } = {}
): Promise<T> {
  return fetchHelper<T>(API_BASE_URL, endpoint, options);
}
