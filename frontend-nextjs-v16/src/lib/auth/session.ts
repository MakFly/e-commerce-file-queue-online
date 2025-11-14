/**
 * Session Management with iron-session
 *
 * Secure session management using iron-session for Next.js App Router
 * Sessions are stored in signed and encrypted cookies
 */

import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import type { SessionData } from '@/types/auth';

/**
 * Session configuration
 * WARNING: Keep SESSION_SECRET secure and never commit it to version control
 */
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};

/**
 * Get the current session
 * This function can be called from Server Components, Server Actions, and Route Handlers
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

/**
 * Create a new session with user data and tokens
 */
export async function createSession(data: SessionData): Promise<void> {
  const session = await getSession();

  session.user = data.user;
  session.accessToken = data.accessToken;
  session.refreshToken = data.refreshToken;
  session.expiresAt = data.expiresAt;
  session.issuedAt = data.issuedAt;

  await session.save();
}

/**
 * Update session with new access token (after refresh)
 */
export async function updateSessionToken(accessToken: string, expiresAt: number): Promise<void> {
  const session = await getSession();

  session.accessToken = accessToken;
  session.expiresAt = expiresAt;

  await session.save();
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/**
 * Check if session exists and is valid
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();

  if (!session.user || !session.accessToken) {
    return false;
  }

  // Check if token is expired
  const now = Date.now();
  if (session.expiresAt && now >= session.expiresAt) {
    return false;
  }

  return true;
}

/**
 * Get the current user from session
 * Returns null if no valid session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session.user || null;
}

/**
 * Check if session needs refresh (80% of expiration time passed)
 */
export async function shouldRefreshToken(): Promise<boolean> {
  const session = await getSession();

  if (!session.expiresAt || !session.issuedAt) {
    return false;
  }

  const now = Date.now();
  const totalLifetime = session.expiresAt - session.issuedAt;
  const elapsed = now - session.issuedAt;

  // Refresh if 80% of lifetime has passed
  return elapsed >= totalLifetime * 0.8;
}
