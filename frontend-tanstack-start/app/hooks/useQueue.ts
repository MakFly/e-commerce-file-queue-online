import { useEffect, useState, useCallback, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import { api } from '~/lib/api'
import {
  SESSION_ID_KEY,
  QUEUE_POLL_INTERVAL,
  QUEUE_HEARTBEAT_INTERVAL,
} from '~/lib/constants'
import type { QueueStatus } from '~/types'

export function useQueue() {
  const [sessionId, setSessionId] = useState<string>('')
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize or retrieve session ID
  useEffect(() => {
    let id = localStorage.getItem(SESSION_ID_KEY)
    if (!id) {
      id = uuidv4()
      localStorage.setItem(SESSION_ID_KEY, id)
    }
    setSessionId(id)

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [])

  // Poll queue status
  const {
    data: queueStatus,
    isLoading,
    error,
    refetch,
  } = useQuery<QueueStatus>({
    queryKey: ['queue-status', sessionId],
    queryFn: () => api.getQueueStatus(sessionId),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data
      // Poll every 5 seconds if waiting, stop if active
      return data?.status === 'waiting' ? QUEUE_POLL_INTERVAL : false
    },
  })

  // Send heartbeat mutation
  const heartbeatMutation = useMutation({
    mutationFn: () => api.sendHeartbeat(sessionId),
  })

  // Send heartbeat periodically when active
  useEffect(() => {
    if (queueStatus?.status === 'active' && sessionId) {
      // Send initial heartbeat
      heartbeatMutation.mutate()

      // Set up interval
      heartbeatIntervalRef.current = setInterval(() => {
        heartbeatMutation.mutate()
      }, QUEUE_HEARTBEAT_INTERVAL)

      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }
      }
    }
  }, [queueStatus?.status, sessionId])

  // Release session mutation
  const releaseMutation = useMutation({
    mutationFn: () => api.releaseSession(sessionId),
  })

  // Release session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId && queueStatus?.status === 'active') {
        // Use sendBeacon for reliable delivery
        const url = `${api['baseURL']}/api/queue/release`
        const blob = new Blob([JSON.stringify({ session_id: sessionId })], {
          type: 'application/json',
        })
        navigator.sendBeacon(url, blob)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [sessionId, queueStatus?.status])

  const releaseSession = useCallback(() => {
    if (sessionId) {
      releaseMutation.mutate()
    }
  }, [sessionId, releaseMutation])

  return {
    sessionId,
    queueStatus,
    isLoading,
    error,
    refetch,
    releaseSession,
    isActive: queueStatus?.status === 'active',
    isWaiting: queueStatus?.status === 'waiting',
  }
}
