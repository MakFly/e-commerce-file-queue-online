import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { queueApi, QueueStatus } from '@/lib/api';

const SESSION_ID_KEY = 'queue_session_id';
const POLL_INTERVAL = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 60000; // 1 minute

export function useQueue() {
  const [sessionId, setSessionId] = useState<string>('');
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem(SESSION_ID_KEY, storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Check queue status
  const checkStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const status = await queueApi.checkStatus(sessionId);
      setQueueStatus(status);
      setError(null);

      // If user is active, start heartbeat
      if (status.status === 'active') {
        startHeartbeat();
        stopPolling();
      } else {
        stopHeartbeat();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check queue status');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Start polling queue status
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    pollIntervalRef.current = setInterval(() => {
      checkStatus();
    }, POLL_INTERVAL);
  }, [checkStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!sessionId) return;

    try {
      await queueApi.sendHeartbeat(sessionId);
    } catch (err) {
      console.error('Heartbeat failed:', err);
      // Session may have expired, check status again
      checkStatus();
    }
  }, [sessionId, checkStatus]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) return;

    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL);
  }, [sendHeartbeat]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Release session
  const releaseSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await queueApi.release(sessionId);
      stopPolling();
      stopHeartbeat();
    } catch (err) {
      console.error('Failed to release session:', err);
    }
  }, [sessionId, stopPolling, stopHeartbeat]);

  // Initial check and setup
  useEffect(() => {
    if (!sessionId) return;

    checkStatus();
    startPolling();

    // Cleanup on unmount
    return () => {
      stopPolling();
      stopHeartbeat();
    };
  }, [sessionId, checkStatus, startPolling, stopPolling, stopHeartbeat]);

  // Release session on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable fire-and-forget
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/queue/release`,
          JSON.stringify({ session_id: sessionId })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionId]);

  return {
    sessionId,
    queueStatus,
    isLoading,
    error,
    checkStatus,
    releaseSession,
  };
}
