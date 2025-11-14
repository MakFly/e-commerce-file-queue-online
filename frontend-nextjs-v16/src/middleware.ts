/**
 * Next.js Middleware for Route Protection
 *
 * WARNING: Middleware should NOT be the only security layer
 * Always verify authentication in the DAL (Data Access Layer) as well
 *
 * Middleware is useful for:
 * - Initial validation (redirect to login if no session)
 * - Redirecting authenticated users away from public routes
 * - Setting headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session';
import type { SessionData } from '@/types/auth';

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
];

/**
 * Auth routes that authenticated users shouldn't access
 */
const AUTH_ROUTES = ['/login', '/register'];

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/orders',
  '/cart',
  '/checkout',
];

/**
 * Admin-only routes
 */
const ADMIN_ROUTES = [
  '/admin',
];

/**
 * Routes that should be excluded from middleware
 */
const EXCLUDED_ROUTES = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for excluded routes
  if (EXCLUDED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session from cookies
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  const isAuthenticated = !!session.user && !!session.accessToken;
  const isAdmin = session.user?.role === 'admin';

  // Check if token is expired
  const isTokenExpired = session.expiresAt ? Date.now() >= session.expiresAt : true;

  // If token expired, clear session
  if (isAuthenticated && isTokenExpired) {
    session.destroy();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect authenticated routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Store the original URL to redirect after login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
