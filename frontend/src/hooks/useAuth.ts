/**
 * Authentication Hooks
 *
 * Client-side hooks for authentication state management
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types/auth';

type AuthContextType = AuthState & {
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

/**
 * Hook to get current user
 */
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'admin';
}

/**
 * Hook to require authentication (redirect if not authenticated)
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to require admin role (redirect if not admin)
 */
export function useRequireAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}
