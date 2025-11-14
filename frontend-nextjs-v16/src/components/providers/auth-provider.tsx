/**
 * Authentication Provider
 *
 * Client-side authentication state management
 * Provides authentication context to the entire application
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/hooks/useAuth';
import { checkAndRefreshToken } from '@/app/actions/auth';
import type { User, AuthState } from '@/types/auth';

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser: User | null;
};

/**
 * Auto-refresh interval (5 minutes)
 */
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
  });

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Fetch fresh user data
      const response = await fetch('/api/auth/user');

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const { user } = await response.json();

      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  /**
   * Auto-refresh token periodically
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const result = await checkAndRefreshToken();

        if (!result.success) {
          // Token refresh failed, user needs to login again
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          router.push('/login');
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, router]);

  /**
   * Refresh user on window focus (to detect session changes)
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const handleFocus = () => {
      refreshUser();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [state.isAuthenticated, refreshUser]);

  const value = {
    ...state,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
