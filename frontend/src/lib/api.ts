import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface QueueStatus {
  status: 'active' | 'waiting';
  position?: number;
  queue_length?: number;
  estimated_wait_seconds?: number;
  active_users?: number;
  max_users?: number;
  message?: string;
}

export const queueApi = {
  checkStatus: async (sessionId: string): Promise<QueueStatus> => {
    const response = await api.get('/api/queue/status', {
      params: { session_id: sessionId },
      headers: { 'X-Session-Id': sessionId },
    });
    return response.data;
  },

  sendHeartbeat: async (sessionId: string) => {
    const response = await api.post('/api/queue/heartbeat',
      { session_id: sessionId },
      { headers: { 'X-Session-Id': sessionId } }
    );
    return response.data;
  },

  release: async (sessionId: string) => {
    const response = await api.post('/api/queue/release',
      { session_id: sessionId },
      { headers: { 'X-Session-Id': sessionId } }
    );
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/queue/stats');
    return response.data;
  },
};

export const productApi = {
  getProducts: async (sessionId: string) => {
    const response = await api.get('/api/products', {
      headers: { 'X-Session-Id': sessionId },
    });
    return response.data;
  },
};

// Admin API Types
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

// Admin API
export const adminApi = {
  getDashboard: async (): Promise<AdminDashboard> => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  getHistory: async (minutes: number = 60): Promise<HistoryData[]> => {
    const response = await api.get('/api/admin/history', {
      params: { minutes },
    });
    return response.data;
  },

  kickUser: async (sessionId: string) => {
    const response = await api.post('/api/admin/kick-user', {
      session_id: sessionId,
    });
    return response.data;
  },

  clearQueue: async () => {
    const response = await api.post('/api/admin/clear-queue');
    return response.data;
  },

  updateConfig: async (config: { max_concurrent_users?: number; queue_enabled?: boolean }) => {
    const response = await api.post('/api/admin/update-config', config);
    return response.data;
  },

  getRedisInfo: async (): Promise<RedisInfo> => {
    const response = await api.get('/api/admin/redis-info');
    return response.data;
  },
};

// E-commerce API Types
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

// E-commerce API
export const ecommerceApi = {
  // Products
  getProducts: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }, sessionId?: string): Promise<{ products: Product[]; total: number }> => {
    const response = await api.get('/api/products', {
      params,
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
    });
    return response.data;
  },

  getProduct: async (id: number, sessionId?: string): Promise<Product> => {
    const response = await api.get(`/api/products/${id}`, {
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
    });
    return response.data;
  },

  getCategories: async (sessionId?: string): Promise<string[]> => {
    const response = await api.get('/api/categories', {
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
    });
    return response.data;
  },

  checkStock: async (items: { product_id: number; quantity: number }[], sessionId?: string) => {
    const response = await api.post(
      '/api/products/check-stock',
      { items },
      { headers: sessionId ? { 'X-Session-Id': sessionId } : {} }
    );
    return response.data;
  },

  // Orders
  createOrder: async (orderData: CreateOrderData, sessionId: string): Promise<{ success: boolean; message: string; order: Order }> => {
    const response = await api.post('/api/orders', orderData, {
      headers: { 'X-Session-Id': sessionId },
    });
    return response.data;
  },

  getOrder: async (id: number, sessionId: string): Promise<Order> => {
    const response = await api.get(`/api/orders/${id}`, {
      headers: { 'X-Session-Id': sessionId },
    });
    return response.data;
  },

  getOrderByNumber: async (orderNumber: string, sessionId: string): Promise<Order> => {
    const response = await api.get(`/api/orders/number/${orderNumber}`, {
      headers: { 'X-Session-Id': sessionId },
    });
    return response.data;
  },

  processPayment: async (orderId: number, paymentData: PaymentData, sessionId: string) => {
    const response = await api.post(`/api/orders/${orderId}/payment`, paymentData, {
      headers: { 'X-Session-Id': sessionId },
    });
    return response.data;
  },

  getUserOrders: async (sessionId: string): Promise<{ orders: Order[]; total: number }> => {
    const response = await api.get('/api/my-orders', {
      headers: { 'X-Session-Id': sessionId },
    });
    return response.data;
  },
};
