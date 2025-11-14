/**
 * Admin Types
 *
 * Types relatifs à l'interface d'administration
 */

export type AdminUserStatus = 'active' | 'waiting';

export type SystemStatus = 'healthy' | 'moderate' | 'warning' | 'critical';

export type AdminUser = {
  session_id: string;
  full_session_id: string;
  joined_at: string;
  ttl?: number;
  expires_in?: string;
  position?: number;
  wait_time?: string;
  estimated_wait?: string;
};

export type AdminDashboard = {
  summary: {
    active_users: number;
    waiting_users: number;
    total_users: number;
    max_concurrent_users: number;
    queue_enabled: boolean;
    usage_percentage: number;
    available_slots: number;
    status: SystemStatus;
  };
  active_users: AdminUser[];
  waiting_users: AdminUser[];
  config: {
    max_concurrent_users: number;
    queue_enabled: boolean;
    session_ttl: number;
    bypass_token: string;
  };
};

export type AdminStats = {
  active_users: number;
  waiting_users: number;
  total_users: number;
  max_concurrent_users: number;
  queue_enabled: boolean;
  usage_percentage: number;
  available_slots: number;
  status: string;
  timestamp: number;
};

export type HistoryData = {
  timestamp: number;
  time: string;
  active_users: number;
  waiting_users: number;
};

export type RedisInfo = {
  connected_clients: string;
  used_memory_human: string;
  used_memory_peak_human: string;
  total_commands_processed: string;
  uptime_in_seconds: number;
  uptime_in_days: number;
};

export type QueueConfig = {
  max_concurrent_users?: number;
  queue_enabled?: boolean;
};
