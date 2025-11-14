'use client';

/**
 * Queue Hooks with React Query
 *
 * Modern queue management hooks using TanStack Query
 * This is an alternative/complement to the existing useQueue hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { apiClient, type QueueStatus, type QueueStats } from '@/lib/api-client';

/**
 * Hook to fetch queue status
 */
export function useQueueStatus(sessionId: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.queue.status(sessionId),
    queryFn: async () => {
      const response = await apiClient.getQueueStatus(sessionId);
      return response;
    },
    enabled: !!sessionId,
    refetchInterval: options?.refetchInterval || 5000, // Default 5 seconds
    staleTime: 0, // Always consider stale for real-time updates
  });
}

/**
 * Hook to fetch queue statistics
 */
export function useQueueStats(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.queue.stats(),
    queryFn: async () => {
      const response = await apiClient.getQueueStats();
      return response;
    },
    refetchInterval: options?.refetchInterval || 10000, // Default 10 seconds
    staleTime: 5000,
  });
}

/**
 * Hook to send heartbeat
 */
export function useHeartbeat(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.sendHeartbeat(sessionId);
      return response;
    },
    onSuccess: () => {
      // Optionally invalidate queue status
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.status(sessionId) });
    },
  });
}

/**
 * Hook to release session
 */
export function useReleaseSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.releaseSession(sessionId);
      return response;
    },
    onSuccess: () => {
      // Clear all queue-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.queue.all });
    },
  });
}

/**
 * Combined hook for queue management
 * Provides status, heartbeat, and release functionality
 */
export function useQueueManagement(sessionId: string) {
  const status = useQueueStatus(sessionId, { refetchInterval: 5000 });
  const heartbeat = useHeartbeat(sessionId);
  const release = useReleaseSession(sessionId);

  return {
    // Status
    queueStatus: status.data,
    isLoading: status.isLoading,
    isError: status.isError,
    error: status.error,

    // Actions
    sendHeartbeat: heartbeat.mutate,
    releaseSession: release.mutate,

    // State
    isActive: status.data?.status === 'active',
    isWaiting: status.data?.status === 'waiting',
    position: status.data?.position,
    estimatedWait: status.data?.estimated_wait_seconds,
  };
}
