/**
 * API Helper Functions
 */

import { logApiRequest, logApiResponse, logApiError } from './logger'

/**
 * Handle fetch response with logging
 */
export async function handleFetchResponse<T>(
  response: Response,
  startTime?: number
): Promise<T> {
  const duration = startTime ? Math.round(performance.now() - startTime) : 0

  if (!response.ok) {
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }

    const error = new Error(errorData.message || `HTTP ${response.status}`)

    // Log error response
    if (startTime) {
      logApiResponse(
        'UNKNOWN',
        response.url,
        response.status,
        duration,
        errorData
      )
    }

    throw error
  }

  const data = await response.json()

  // Log successful response
  if (startTime) {
    logApiResponse(
      'UNKNOWN',
      response.url,
      response.status,
      duration
    )
  }

  return data
}

/**
 * Create headers with session ID and auth token
 */
export function createHeaders(
  sessionId?: string,
  additionalHeaders?: HeadersInit
): Headers {
  const headers = new Headers(additionalHeaders)

  headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')

  if (sessionId) {
    headers.set('X-Session-Id', sessionId)
  }

  return headers
}

/**
 * Build URL with query parameters
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, any>
): string {
  const url = new URL(path, baseUrl)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

/**
 * Fetch wrapper with logging
 */
export async function fetchWithLogging<T>(
  method: string,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const startTime = performance.now()

  // Log request
  logApiRequest(method, url, options.body ? JSON.parse(options.body as string) : undefined)

  try {
    const response = await fetch(url, {
      ...options,
      method,
      cache: 'no-store',
    })

    const duration = Math.round(performance.now() - startTime)

    if (!response.ok) {
      let errorData: any
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }

      // Log error response
      logApiResponse(method, url, response.status, duration, errorData)

      const error = new Error(errorData.message || `HTTP ${response.status}`)
      throw error
    }

    const data = await response.json()

    // Log successful response
    logApiResponse(method, url, response.status, duration)

    return data
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)

    // Log error
    if (error instanceof Error) {
      logApiError(method, url, error, duration)
    }

    throw error
  }
}
