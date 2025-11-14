import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          E-Commerce Queue
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
            activeProps={{ className: 'text-primary' }}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className="text-sm font-medium hover:text-primary transition-colors"
            activeProps={{ className: 'text-primary' }}
          >
            Shop
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/cart"
                className="text-sm font-medium hover:text-primary transition-colors"
                activeProps={{ className: 'text-primary' }}
              >
                Cart
              </Link>
              <Link
                to="/orders"
                className="text-sm font-medium hover:text-primary transition-colors"
                activeProps={{ className: 'text-primary' }}
              >
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  activeProps={{ className: 'text-primary' }}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </span>
                {user?.role === 'admin' && (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
