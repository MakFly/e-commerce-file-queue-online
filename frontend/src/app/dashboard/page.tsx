/**
 * Dashboard Page (Protected)
 *
 * Example of a protected page using DAL for auth verification
 */

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/dal';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  // IMPORTANT: Always verify auth in Server Components using DAL
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.name}
          </p>
        </div>

        <form action={logout}>
          <Button type="submit" variant="outline">
            Logout
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            User Information
          </h2>
          <div className="mt-4 space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Account Status
          </h2>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Active</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Quick Actions
          </h2>
          <div className="mt-4 space-y-2">
            <Button className="w-full" variant="outline">
              View Profile
            </Button>
            <Button className="w-full" variant="outline">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
