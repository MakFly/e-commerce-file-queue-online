/**
 * API Client - Compatible SSR/CSR
 *
 * This module provides a clean API client that works both on server and client side.
 * It handles authentication, session management, and provides type-safe methods.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export interface QueueStatus {
  status: 'active' | 'waiting';
  position?: number;
  queue_length?: number;
  estimated_wait_seconds?: number;
  active_users?: number;
  max_users?: number;
}

export interface QueueStats {
  active_users: number;
  waiting_users: number;
  max_concurrent_users: number;
  queue_enabled: boolean;
}

/**
 * Create axios instance with default config
 */
function createAxiosInstance(sessionId?: string): AxiosInstance {
  const config: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (sessionId) {
    config.headers = {
      ...config.headers,
      'X-Session-Id': sessionId,
    };
  }

  return axios.create(config);
}

/**
 * Get session ID from localStorage (client-side only)
 */
function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session_id');
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      status: axiosError.response?.status,
      errors: axiosError.response?.data?.errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred',
  };
}

/**
 * API Client Class
 */
class ApiClient {
  private getClient(sessionId?: string): AxiosInstance {
    const sid = sessionId || getSessionId();
    return createAxiosInstance(sid || undefined);
  }

  // ==================== Queue API ====================

  async getQueueStatus(sessionId: string): Promise<QueueStatus> {
    const client = this.getClient(sessionId);
    const response = await client.get('/api/queue/status', {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async sendHeartbeat(sessionId: string): Promise<{ status: string }> {
    const client = this.getClient(sessionId);
    const response = await client.post('/api/queue/heartbeat', {
      session_id: sessionId,
    });
    return response.data;
  }

  async releaseSession(sessionId: string): Promise<{ status: string }> {
    const client = this.getClient(sessionId);
    const response = await client.post('/api/queue/release', {
      session_id: sessionId,
    });
    return response.data;
  }

  async getQueueStats(): Promise<QueueStats> {
    const client = this.getClient();
    const response = await client.get('/api/queue/stats');
    return response.data;
  }

  // ==================== Products API ====================

  async getProducts(params?: {
    category?: string;
    sessionId?: string;
  }): Promise<{ products: Product[] }> {
    const client = this.getClient(params?.sessionId);
    const response = await client.get('/api/products', {
      params: params?.category ? { category: params.category } : undefined,
    });
    return response.data;
  }

  async getProduct(id: number, sessionId?: string): Promise<{ product: Product }> {
    const client = this.getClient(sessionId);
    const response = await client.get(`/api/products/${id}`);
    return response.data;
  }

  // ==================== Orders API ====================

  async createOrder(data: CreateOrderData, sessionId?: string): Promise<{ order: Order }> {
    const client = this.getClient(sessionId);
    const response = await client.post('/api/orders', data);
    return response.data;
  }

  async getOrders(sessionId?: string): Promise<{ orders: Order[] }> {
    const client = this.getClient(sessionId);
    const response = await client.get('/api/orders');
    return response.data;
  }

  async getOrder(id: number, sessionId?: string): Promise<{ order: Order }> {
    const client = this.getClient(sessionId);
    const response = await client.get(`/api/orders/${id}`);
    return response.data;
  }

  // ==================== Admin API ====================

  async getAdminDashboard(): Promise<any> {
    const client = this.getClient();
    const response = await client.get('/api/admin/dashboard');
    return response.data;
  }

  async kickUser(sessionId: string): Promise<{ message: string }> {
    const client = this.getClient();
    const response = await client.post('/api/admin/kick-user', {
      session_id: sessionId,
    });
    return response.data;
  }

  async clearQueue(): Promise<{ message: string }> {
    const client = this.getClient();
    const response = await client.post('/api/admin/clear-queue');
    return response.data;
  }

  async updateQueueConfig(config: {
    max_concurrent_users?: number;
    queue_enabled?: boolean;
  }): Promise<{ message: string; config: any }> {
    const client = this.getClient();
    const response = await client.post('/api/admin/update-config', config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for server-side usage with explicit session
export function createApiClient(sessionId?: string) {
  return {
    client: createAxiosInstance(sessionId),
    sessionId,
  };
}
