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
