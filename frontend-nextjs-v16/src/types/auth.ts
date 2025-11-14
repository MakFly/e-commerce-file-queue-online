/**
 * Authentication Types
 *
 * Type definitions for authentication and session management
 */

export type User = {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt?: string;
};

export type SessionData = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp d'expiration
  issuedAt: number; // Timestamp de création
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Secondes avant expiration
};

export type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};

export type RefreshTokenResponse = {
  accessToken: string;
  expiresIn: number;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type JWTPayload = {
  sub: string; // User ID
  email: string;
  role: 'user' | 'admin';
  iat: number; // Issued at
  exp: number; // Expiration
};
