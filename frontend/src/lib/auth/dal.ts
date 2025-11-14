/**
 * Data Access Layer (DAL)
 *
 * This is the main security layer for authentication verification
 * According to Next.js best practices, never rely solely on middleware
 * Always verify authentication in the DAL before accessing sensitive data
 */

import 'server-only';
import { cache } from 'react';
import { getSession, isSessionValid } from './session';
import type { User } from '@/types/auth';

/**
 * Verify request authentication
 * This should be called at the start of every Server Component, Server Action,
 * or Route Handler that requires authentication
 *
 * Using React's cache() ensures this is only called once per request
 */
export const verifySession = cache(async (): Promise<{
  isAuth: boolean;
  user: User | null;
  accessToken: string | null;
}> => {
  const session = await getSession();
  const isValid = await isSessionValid();

  if (!isValid || !session.user) {
    return {
      isAuth: false,
      user: null,
      accessToken: null,
    };
  }

  return {
    isAuth: true,
    user: session.user,
    accessToken: session.accessToken,
  };
});

/**
 * Get the current authenticated user
 * Throws an error if user is not authenticated
 */
export async function getAuthUser(): Promise<User> {
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  return user;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const { isAuth, user } = await verifySession();
  return isAuth && user?.role === 'admin';
}

/**
 * Require admin role (throws if not admin)
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAuthUser();

  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

/**
 * Get access token for API calls
 * Throws if no valid session
 */
export async function getAccessToken(): Promise<string> {
  const { isAuth, accessToken } = await verifySession();

  if (!isAuth || !accessToken) {
    throw new Error('Unauthorized: No valid access token');
  }

  return accessToken;
}
