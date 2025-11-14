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
