import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { StatsCard } from '@/components/admin/StatsCard'
import { AdminControls } from '@/components/admin/AdminControls'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const { isAuthenticated, user, token } = useAuth()
  const queryClient = useQueryClient()

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" />
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => api.getQueueStats(token),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const toggleQueueMutation = useMutation({
    mutationFn: () => api.toggleQueue(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] })
      toast.success('Queue toggled successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle queue')
    },
  })

  const cleanupMutation = useMutation({
    mutationFn: () => api.cleanupQueue(token!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] })
      toast.success(`Cleaned up ${data.cleaned} expired sessions`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to cleanup')
    },
  })

  const updateMaxUsersMutation = useMutation({
    mutationFn: (maxUsers: number) => api.updateMaxUsers(maxUsers, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] })
      toast.success('Max users updated successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update max users')
    },
  })

  if (isLoading || !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const utilizationPercent = ((stats.active_users / stats.max_concurrent_users) * 100).toFixed(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Active Users"
          value={stats.active_users}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />

        <StatsCard
          title="Waiting Users"
          value={stats.waiting_users}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        <StatsCard
          title="Max Capacity"
          value={stats.max_concurrent_users}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />

        <StatsCard
          title="Utilization"
          value={`${utilizationPercent}%`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      {/* Admin Controls */}
      <AdminControls
        stats={stats}
        onToggleQueue={() => toggleQueueMutation.mutate()}
        onCleanup={() => cleanupMutation.mutate()}
        onUpdateMaxUsers={(maxUsers) => updateMaxUsersMutation.mutate(maxUsers)}
      />
    </div>
  )
}
