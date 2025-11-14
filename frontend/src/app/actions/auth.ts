/**
 * Authentication Server Actions
 *
 * Server Actions for authentication operations
 * These run exclusively on the server and provide type-safe authentication
 */

'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/constants';
import {
  createSession,
  destroySession,
  getSession,
  updateSessionToken,
  shouldRefreshToken,
} from '@/lib/auth/session';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RefreshTokenResponse,
} from '@/types/auth';

/**
 * Validation schemas
 */
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

/**
 * Login action
 */
export async function login(credentials: LoginCredentials) {
  try {
    // Validate input
    const validatedData = loginSchema.parse(credentials);

    // Call backend API
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Échec de la connexion',
      };
    }

    const data: AuthResponse = await response.json();

    // Calculate expiration time
    const expiresAt = Date.now() + data.tokens.expiresIn * 1000;
    const issuedAt = Date.now();

    // Create session
    await createSession({
      user: data.user,
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      expiresAt,
      issuedAt,
    });

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: 'Une erreur est survenue lors de la connexion',
    };
  }
}

/**
 * Register action
 */
export async function register(data: RegisterData) {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Call backend API
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "Échec de l'inscription",
      };
    }

    const authData: AuthResponse = await response.json();

    // Calculate expiration time
    const expiresAt = Date.now() + authData.tokens.expiresIn * 1000;
    const issuedAt = Date.now();

    // Create session
    await createSession({
      user: authData.user,
      accessToken: authData.tokens.accessToken,
      refreshToken: authData.tokens.refreshToken,
      expiresAt,
      issuedAt,
    });

    return {
      success: true,
      user: authData.user,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Une erreur est survenue lors de l'inscription",
    };
  }
}

/**
 * Logout action
 */
export async function logout() {
  try {
    const session = await getSession();

    // Call backend API to invalidate tokens
    if (session.accessToken) {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
    }

    // Destroy session
    await destroySession();

    return { success: true };
  } catch (error) {
    // Always destroy session even if API call fails
    await destroySession();
    return { success: true };
  } finally {
    redirect('/login');
  }
}

/**
 * Refresh access token action
 * This is called automatically when the token needs refresh
 */
export async function refreshAccessToken() {
  try {
    const session = await getSession();

    if (!session.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Call backend API
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: session.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data: RefreshTokenResponse = await response.json();

    // Update session with new token
    const expiresAt = Date.now() + data.expiresIn * 1000;
    await updateSessionToken(data.accessToken, expiresAt);

    return {
      success: true,
      accessToken: data.accessToken,
    };
  } catch (error) {
    // If refresh fails, destroy session
    await destroySession();

    return {
      success: false,
      error: 'Session expired. Please login again.',
    };
  }
}

/**
 * Check and auto-refresh token if needed
 * This should be called periodically on authenticated pages
 */
export async function checkAndRefreshToken() {
  try {
    const needsRefresh = await shouldRefreshToken();

    if (needsRefresh) {
      return await refreshAccessToken();
    }

    return { success: true, refreshed: false };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to check token status',
    };
  }
}
