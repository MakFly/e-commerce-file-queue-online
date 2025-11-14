import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQueue } from '@/hooks/useQueue'
import { useAuth } from '@/hooks/useAuth'
import { QueueWaitingRoom } from '@/components/QueueWaitingRoom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { sessionId, queueStatus, isActive, isWaiting } = useQueue()
  const { isAuthenticated } = useAuth()

  // Show waiting room if user is in queue
  if (isWaiting && queueStatus) {
    return <QueueWaitingRoom queueStatus={queueStatus} />
  }

  // If user is active and authenticated, redirect to shop
  if (isActive && isAuthenticated) {
    return <Navigate to="/shop" />
  }

  // Default home page
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to E-Commerce Queue
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern e-commerce platform with intelligent queue management for high-traffic scenarios.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Queue System</CardTitle>
              <CardDescription>
                Manage high traffic with our virtual waiting room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically regulates site access during peak times to ensure smooth shopping experience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Shopping</CardTitle>
              <CardDescription>
                JWT-based authentication with refresh tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your data is protected with industry-standard security measures and encrypted storage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Live inventory and order tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get instant updates on product availability and order status with our real-time system.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 mt-12">
          {isActive ? (
            <div className="space-y-4">
              <p className="text-lg text-green-600 font-medium">
                You're in! Session active.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/shop">Start Shopping</a>
                </Button>
                {!isAuthenticated && (
                  <Button size="lg" variant="outline" asChild>
                    <a href="/register">Create Account</a>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Session ID: <code className="text-xs bg-muted px-2 py-1 rounded">{sessionId}</code>
              </p>
              <Button size="lg" asChild>
                <a href="/shop">Browse Products</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
