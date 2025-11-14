/**
 * Fetch Helpers
 *
 * Fonctions utilitaires pour les requêtes fetch
 */

import type { ApiError } from '@/types';
import { HTTP_HEADERS } from '../constants';
import { getSessionId } from './session';
import { buildUrl } from './url';

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  sessionId?: string;
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: HeadersInit;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Create fetch headers with default configuration
 */
export function createHeaders(sessionId?: string, customHeaders?: HeadersInit): HeadersInit {
  const headers: HeadersInit = {
    [HTTP_HEADERS.CONTENT_TYPE]: 'application/json',
    [HTTP_HEADERS.ACCEPT]: 'application/json',
    ...customHeaders,
  };

  const sid = sessionId || getSessionId();
  if (sid) {
    headers[HTTP_HEADERS.SESSION_ID] = sid;
  }

  return headers;
}

/**
 * Create fetch options
 */
export function createFetchOptions(options: FetchOptions = {}): RequestInit {
  const {
    method = 'GET',
    sessionId,
    body,
    headers: customHeaders,
    cache,
    revalidate,
    tags,
  } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: createHeaders(sessionId, customHeaders),
    cache: cache || (method === 'GET' ? 'no-store' : undefined),
  };

  // Next.js 16 specific options
  if (revalidate !== undefined || tags) {
    (fetchOptions as any).next = {
      ...(revalidate !== undefined && { revalidate }),
      ...(tags && tags.length > 0 && { tags }),
    };
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  return fetchOptions;
}

/**
 * Handle fetch response and errors
 */
export async function handleFetchResponse<T>(response: Response): Promise<T> {
  // Check if response is ok (status 200-299)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));

    const error: ApiError = {
      message: errorData.message || `Request failed with status ${response.status}`,
      status: response.status,
      errors: errorData.errors,
    };

    throw error;
  }

  // Parse JSON response
  return response.json();
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
    return error as ApiError;
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Unknown error
  return {
    message: 'An unknown error occurred',
  };
}

/**
 * Make a fetch request with all options
 */
export async function fetchApi<T>(
  baseUrl: string,
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOpts } = options;

  // Build URL with query params
  const url = buildUrl(baseUrl, endpoint, params);

  // Create fetch options
  const requestOptions = createFetchOptions(fetchOpts);

  // Make fetch request
  const response = await fetch(url, requestOptions);

  // Handle response
  return handleFetchResponse<T>(response);
}

/**
 * Wrapper for simple GET request
 */
export async function get<T>(
  baseUrl: string,
  endpoint: string,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(baseUrl, endpoint, { ...options, method: 'GET' });
}

/**
 * Wrapper for simple POST request
 */
export async function post<T>(
  baseUrl: string,
  endpoint: string,
  body?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(baseUrl, endpoint, { ...options, method: 'POST', body });
}

/**
 * Wrapper for simple PUT request
 */
export async function put<T>(
  baseUrl: string,
  endpoint: string,
  body?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(baseUrl, endpoint, { ...options, method: 'PUT', body });
}

/**
 * Wrapper for simple PATCH request
 */
export async function patch<T>(
  baseUrl: string,
  endpoint: string,
  body?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(baseUrl, endpoint, { ...options, method: 'PATCH', body });
}

/**
 * Wrapper for simple DELETE request
 */
export async function del<T>(
  baseUrl: string,
  endpoint: string,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(baseUrl, endpoint, { ...options, method: 'DELETE' });
}
