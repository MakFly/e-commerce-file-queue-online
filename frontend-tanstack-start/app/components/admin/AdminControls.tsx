import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import type { QueueStats } from '@/types'

type AdminControlsProps = {
  stats: QueueStats
  onToggleQueue: () => void
  onCleanup: () => void
  onUpdateMaxUsers: (maxUsers: number) => void
}

export function AdminControls({ stats, onToggleQueue, onCleanup, onUpdateMaxUsers }: AdminControlsProps) {
  const [maxUsers, setMaxUsers] = useState(stats.max_concurrent_users)

  const handleUpdateMaxUsers = () => {
    if (maxUsers > 0) {
      onUpdateMaxUsers(maxUsers)
    }
  }

  return (
    <div className="space-y-4">
      {/* Queue Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Queue System</CardTitle>
              <CardDescription>Control the queue system behavior</CardDescription>
            </div>
            <Badge variant={stats.queue_enabled ? 'default' : 'secondary'}>
              {stats.queue_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={onToggleQueue} variant={stats.queue_enabled ? 'destructive' : 'default'}>
              {stats.queue_enabled ? 'Disable Queue' : 'Enable Queue'}
            </Button>
            <Button onClick={onCleanup} variant="outline">
              Cleanup Expired Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Max Users Card */}
      <Card>
        <CardHeader>
          <CardTitle>Maximum Concurrent Users</CardTitle>
          <CardDescription>Set the maximum number of users allowed on the site simultaneously</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                min="1"
                value={maxUsers}
                onChange={(e) => setMaxUsers(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleUpdateMaxUsers}>Update</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Current: {stats.max_concurrent_users} users
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
