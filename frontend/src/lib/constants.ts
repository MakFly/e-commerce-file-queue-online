/**
 * API Constants
 *
 * Constantes globales pour l'API
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_ME: '/api/auth/me',

  // Queue
  QUEUE_STATUS: '/api/queue/status',
  QUEUE_HEARTBEAT: '/api/queue/heartbeat',
  QUEUE_RELEASE: '/api/queue/release',
  QUEUE_STATS: '/api/queue/stats',

  // Products
  PRODUCTS: '/api/products',
  PRODUCT: (id: number) => `/api/products/${id}`,

  // Orders
  ORDERS: '/api/orders',
  ORDER: (id: number) => `/api/orders/${id}`,

  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_HISTORY: '/api/admin/history',
  ADMIN_KICK_USER: '/api/admin/kick-user',
  ADMIN_CLEAR_QUEUE: '/api/admin/clear-queue',
  ADMIN_UPDATE_CONFIG: '/api/admin/update-config',
  ADMIN_REDIS_INFO: '/api/admin/redis-info',
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  SESSION_ID: 'X-Session-Id',
} as const;

export const CACHE_TIMES = {
  NO_CACHE: 0,
  SHORT: 60, // 1 minute
  MEDIUM: 5 * 60, // 5 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;

export const QUERY_STALE_TIMES = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  SHORT: 60 * 1000, // 1 minute
  LONG: 10 * 60 * 1000, // 10 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * TanStack Query Cache Configuration
 */
export const QUERY_CACHE_CONFIG = {
  STALE_TIME: QUERY_STALE_TIMES.DEFAULT,
  GC_TIME: QUERY_STALE_TIMES.LONG,
  RETRY_COUNT: 1,
  MUTATION_RETRY_COUNT: 0,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;
