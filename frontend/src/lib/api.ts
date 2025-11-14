/**
 * API Library - Native Fetch Implementation
 *
 * Legacy API wrapper using native fetch (NO axios)
 * This file maintains backward compatibility with existing code
 * while using the new fetch-based implementation
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Native fetch wrapper with error handling
 */
async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Helper to build URL with query params
 */
function buildUrl(path: string, params?: Record<string, any>): string {
  const url = `${API_URL}${path}`;
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

// ==================== Types ====================

export interface QueueStatus {
  status: 'active' | 'waiting';
  position?: number;
  queue_length?: number;
  estimated_wait_seconds?: number;
  active_users?: number;
  max_users?: number;
  message?: string;
}

export interface AdminUser {
  session_id: string;
  full_session_id: string;
  joined_at: string;
  ttl?: number;
  expires_in?: string;
  position?: number;
  wait_time?: string;
  estimated_wait?: string;
}

export interface AdminDashboard {
  summary: {
    active_users: number;
    waiting_users: number;
    total_users: number;
    max_concurrent_users: number;
    queue_enabled: boolean;
    usage_percentage: number;
    available_slots: number;
    status: 'healthy' | 'moderate' | 'warning' | 'critical';
  };
  active_users: AdminUser[];
  waiting_users: AdminUser[];
  config: {
    max_concurrent_users: number;
    queue_enabled: boolean;
    session_ttl: number;
    bypass_token: string;
  };
}

export interface AdminStats {
  active_users: number;
  waiting_users: number;
  total_users: number;
  max_concurrent_users: number;
  queue_enabled: boolean;
  usage_percentage: number;
  available_slots: number;
  status: string;
  timestamp: number;
}

export interface HistoryData {
  timestamp: number;
  time: string;
  active_users: number;
  waiting_users: number;
}

export interface RedisInfo {
  connected_clients: string;
  used_memory_human: string;
  used_memory_peak_human: string;
  total_commands_processed: string;
  uptime_in_seconds: number;
  uptime_in_days: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
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
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes: string | null;
  session_id: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer';
  items: { product_id: number; quantity: number }[];
  notes?: string;
}

export interface PaymentData {
  payment_method: string;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
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
      `${API_URL}/api/queue/heartbeat`,
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify({ session_id: sessionId }),
      }
    );
  },

  release: async (sessionId: string) => {
    return fetchWrapper(
      `${API_URL}/api/queue/release`,
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify({ session_id: sessionId }),
      }
    );
  },

  getStats: async () => {
    return fetchWrapper(`${API_URL}/api/queue/stats`);
  },
};

// ==================== Product API (Legacy) ====================

export const productApi = {
  getProducts: async (sessionId: string) => {
    return fetchWrapper(
      `${API_URL}/api/products`,
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },
};

// ==================== Admin API ====================

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboard> => {
    return fetchWrapper<AdminDashboard>(`${API_URL}/api/admin/dashboard`);
  },

  getStats: async (): Promise<AdminStats> => {
    return fetchWrapper<AdminStats>(`${API_URL}/api/admin/stats`);
  },

  getHistory: async (minutes: number = 60): Promise<HistoryData[]> => {
    return fetchWrapper<HistoryData[]>(
      buildUrl('/api/admin/history', { minutes })
    );
  },

  kickUser: async (sessionId: string) => {
    return fetchWrapper(
      `${API_URL}/api/admin/kick-user`,
      {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      }
    );
  },

  clearQueue: async () => {
    return fetchWrapper(
      `${API_URL}/api/admin/clear-queue`,
      {
        method: 'POST',
      }
    );
  },

  updateConfig: async (config: { max_concurrent_users?: number; queue_enabled?: boolean }) => {
    return fetchWrapper(
      `${API_URL}/api/admin/update-config`,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  },

  getRedisInfo: async (): Promise<RedisInfo> => {
    return fetchWrapper<RedisInfo>(`${API_URL}/api/admin/redis-info`);
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
      `${API_URL}/api/products/${id}`,
      {
        headers: sessionId ? { 'X-Session-Id': sessionId } : {},
      }
    );
  },

  getCategories: async (sessionId?: string): Promise<string[]> => {
    return fetchWrapper<string[]>(
      `${API_URL}/api/categories`,
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
      `${API_URL}/api/products/check-stock`,
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
      `${API_URL}/api/orders`,
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify(orderData),
      }
    );
  },

  getOrder: async (id: number, sessionId: string): Promise<Order> => {
    return fetchWrapper<Order>(
      `${API_URL}/api/orders/${id}`,
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },

  getOrderByNumber: async (orderNumber: string, sessionId: string): Promise<Order> => {
    return fetchWrapper<Order>(
      `${API_URL}/api/orders/number/${orderNumber}`,
      {
        headers: { 'X-Session-Id': sessionId },
      }
    );
  },

  processPayment: async (orderId: number, paymentData: PaymentData, sessionId: string) => {
    return fetchWrapper(
      `${API_URL}/api/orders/${orderId}/payment`,
      {
        method: 'POST',
        headers: { 'X-Session-Id': sessionId },
        body: JSON.stringify(paymentData),
      }
    );
  },

  getUserOrders: async (sessionId: string): Promise<{ orders: Order[]; total: number }> => {
    return fetchWrapper<{ orders: Order[]; total: number }>(
      `${API_URL}/api/my-orders`,
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
    const responseData = await fetchWrapper<T>(`${API_URL}${url}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: config?.headers,
    });
    return { data: responseData };
  },
};
