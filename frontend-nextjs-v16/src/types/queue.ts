/**
 * Queue Types
 *
 * Types relatifs au système de file d'attente
 */

export type QueueStatusType = 'active' | 'waiting';

export type QueueStatus = {
  status: QueueStatusType;
  position?: number;
  queue_length?: number;
  estimated_wait_seconds?: number;
  active_users?: number;
  max_users?: number;
  message?: string;
};

export type QueueStats = {
  active_users: number;
  waiting_users: number;
  max_concurrent_users: number;
  queue_enabled: boolean;
};
