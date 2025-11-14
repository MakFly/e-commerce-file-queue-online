/**
 * Session Helpers
 *
 * Fonctions pour gérer la session utilisateur
 */

const SESSION_KEY = 'session_id';

/**
 * Get session ID from localStorage (client-side only)
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

/**
 * Set session ID in localStorage (client-side only)
 */
export function setSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, sessionId);
}

/**
 * Remove session ID from localStorage (client-side only)
 */
export function removeSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Check if we're on client-side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if we're on server-side
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Generate a new session ID (UUID v4)
 */
export function generateSessionId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create session ID
 */
export function getOrCreateSessionId(): string {
  let sessionId = getSessionId();

  if (!sessionId) {
    sessionId = generateSessionId();
    setSessionId(sessionId);
  }

  return sessionId;
}
