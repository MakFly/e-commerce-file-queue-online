/**
 * API Client - Native Fetch Implementation (SSR/CSR Compatible)
 *
 * Modern API client using native fetch API for Next.js 16
 * Fully compatible with Server Components and Client Components
 * NO external HTTP libraries - pure fetch API
 */

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
 * Get session ID from localStorage (client-side only)
 */
function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session_id');
}

/**
 * Create fetch options with default configuration
 */
function createFetchOptions(
  method: string = 'GET',
  sessionId?: string,
  body?: any
): RequestInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const options: RequestInit = {
    method,
    headers,
    // Next.js 16: Use cache options for better performance
    cache: method === 'GET' ? 'no-store' : undefined,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  return options;
}

/**
 * Handle fetch response and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Check if response is ok (status 200-299)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));

    throw {
      message: errorData.message || `Request failed with status ${response.status}`,
      status: response.status,
      errors: errorData.errors,
    } as ApiError;
  }

  // Parse JSON response
  return response.json();
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'message' in error) {
    return error as ApiError;
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
 * Make a fetch request with automatic session ID injection
 */
async function fetchApi<T>(
  endpoint: string,
  options: {
    method?: string;
    sessionId?: string;
    body?: any;
    params?: Record<string, string | number | undefined>;
  } = {}
): Promise<T> {
  const { method = 'GET', sessionId, body, params } = options;

  // Auto-inject session ID if not provided (client-side only)
  const sid = sessionId || getSessionId() || undefined;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Make fetch request
  const fetchOptions = createFetchOptions(method, sid, body);
  const response = await fetch(url, fetchOptions);

  // Handle response
  return handleResponse<T>(response);
}

/**
 * API Client Class
 */
class ApiClient {
  // ==================== Queue API ====================

  async getQueueStatus(sessionId: string): Promise<QueueStatus> {
    return fetchApi('/api/queue/status', {
      sessionId,
      params: { session_id: sessionId },
    });
  }

  async sendHeartbeat(sessionId: string): Promise<{ status: string }> {
    return fetchApi('/api/queue/heartbeat', {
      method: 'POST',
      sessionId,
      body: { session_id: sessionId },
    });
  }

  async releaseSession(sessionId: string): Promise<{ status: string }> {
    return fetchApi('/api/queue/release', {
      method: 'POST',
      sessionId,
      body: { session_id: sessionId },
    });
  }

  async getQueueStats(): Promise<QueueStats> {
    return fetchApi('/api/queue/stats');
  }

  // ==================== Products API ====================

  async getProducts(params?: {
    category?: string;
    sessionId?: string;
  }): Promise<{ products: Product[] }> {
    return fetchApi('/api/products', {
      sessionId: params?.sessionId,
      params: params?.category ? { category: params.category } : undefined,
    });
  }

  async getProduct(id: number, sessionId?: string): Promise<{ product: Product }> {
    return fetchApi(`/api/products/${id}`, {
      sessionId,
    });
  }

  // ==================== Orders API ====================

  async createOrder(data: CreateOrderData, sessionId?: string): Promise<{ order: Order }> {
    return fetchApi('/api/orders', {
      method: 'POST',
      sessionId,
      body: data,
    });
  }

  async getOrders(sessionId?: string): Promise<{ orders: Order[] }> {
    return fetchApi('/api/orders', {
      sessionId,
    });
  }

  async getOrder(id: number, sessionId?: string): Promise<{ order: Order }> {
    return fetchApi(`/api/orders/${id}`, {
      sessionId,
    });
  }

  // ==================== Admin API ====================

  async getAdminDashboard(): Promise<any> {
    return fetchApi('/api/admin/dashboard');
  }

  async kickUser(sessionId: string): Promise<{ message: string }> {
    return fetchApi('/api/admin/kick-user', {
      method: 'POST',
      body: { session_id: sessionId },
    });
  }

  async clearQueue(): Promise<{ message: string }> {
    return fetchApi('/api/admin/clear-queue', {
      method: 'POST',
    });
  }

  async updateQueueConfig(config: {
    max_concurrent_users?: number;
    queue_enabled?: boolean;
  }): Promise<{ message: string; config: any }> {
    return fetchApi('/api/admin/update-config', {
      method: 'POST',
      body: config,
    });
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
    params?: Record<string, string | number | undefined>;
    // Next.js 16 cache options
    cache?: RequestCache;
    revalidate?: number | false;
    tags?: string[];
  } = {}
): Promise<T> {
  const { method = 'GET', sessionId, body, params, cache, revalidate, tags } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Create fetch options
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    cache: cache || (method === 'GET' ? 'no-store' : undefined),
  };

  // Next.js 16 specific options
  if (revalidate !== undefined) {
    (fetchOptions as any).next = { revalidate };
  }

  if (tags && tags.length > 0) {
    (fetchOptions as any).next = { ...(fetchOptions as any).next, tags };
  }

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  // Make fetch request
  const response = await fetch(url, fetchOptions);

  // Handle response
  return handleResponse<T>(response);
}
