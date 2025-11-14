import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { formatWaitTime } from '@/lib/utils'
import type { QueueStatus } from '@/types'

type QueueWaitingRoomProps = {
  queueStatus: QueueStatus
}

export function QueueWaitingRoom({ queueStatus }: QueueWaitingRoomProps) {
  const [dots, setDots] = useState('.')

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  if (queueStatus.status !== 'waiting') {
    return null
  }

  const { position = 0, queue_length = 0, estimated_wait_seconds = 0, active_users = 0, max_users = 0 } = queueStatus

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl">You're in the Queue</CardTitle>
          <CardDescription className="text-lg mt-2">
            Please wait while we prepare your shopping experience{dots}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Position Badge */}
          <div className="flex justify-center">
            <Badge variant="default" className="text-lg px-6 py-2">
              Position: {position} of {queue_length}
            </Badge>
          </div>

          {/* Estimated Wait Time */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Estimated wait time</p>
            <p className="text-4xl font-bold text-primary">
              {formatWaitTime(estimated_wait_seconds)}
            </p>
          </div>

          <Separator />

          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{active_users}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{queue_length}</p>
              <p className="text-sm text-muted-foreground">In Queue</p>
            </div>
          </div>

          <Separator />

          {/* Info Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Please keep this page open. You'll be automatically redirected when it's your turn.
            </p>
            <p className="text-xs text-muted-foreground">
              Current capacity: {active_users} / {max_users}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out"
              style={{
                width: `${queue_length > 0 ? ((queue_length - position + 1) / queue_length) * 100 : 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
