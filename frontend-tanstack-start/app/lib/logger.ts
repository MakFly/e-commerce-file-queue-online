import pino from 'pino'

/**
 * Application Logger
 * Uses Pino - High-performance logger for Node.js
 */

// Determine if we're in browser or server
const isBrowser = typeof window !== 'undefined'

// Configure logger based on environment
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Browser transport (only client-side)
  browser: isBrowser ? {
    asObject: true,
    serialize: true,
    transmit: {
      level: 'info',
      send: (level, logEvent) => {
        // In production, you could send logs to a service like Sentry, LogRocket, etc.
        if (process.env.NODE_ENV === 'production') {
          // Example: Send to external logging service
          // fetch('/api/logs', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(logEvent),
          // }).catch(console.error)
        }
      },
    },
  } : undefined,

  // Server-side configuration
  ...(!isBrowser && {
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    } : undefined,
  }),

  // Custom serializers
  serializers: {
    error: pino.stdSerializers.err,
    request: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers?.['user-agent'],
      },
    }),
    response: (res: any) => ({
      statusCode: res.statusCode,
    }),
  },
})

/**
 * API Logger - Specific logger for API calls
 */
export const apiLogger = logger.child({ module: 'api' })

/**
 * Log API request
 */
export function logApiRequest(method: string, url: string, data?: any) {
  const logData: any = {
    method,
    url,
    timestamp: new Date().toISOString(),
  }

  if (data) {
    // Remove sensitive data
    const sanitized = { ...data }
    delete sanitized.password
    delete sanitized.password_confirmation
    delete sanitized.token
    delete sanitized.refresh_token
    logData.data = sanitized
  }

  apiLogger.info(logData, `📤 ${method} ${url}`)
}

/**
 * Log API response
 */
export function logApiResponse(
  method: string,
  url: string,
  status: number,
  duration: number,
  data?: any
) {
  const emoji = getStatusEmoji(status)
  const level = getLogLevel(status)

  const logData: any = {
    method,
    url,
    status,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
  }

  // Log response data for errors
  if (status >= 400 && data) {
    const sanitized = { ...data }
    delete sanitized.token
    delete sanitized.refresh_token
    logData.response = sanitized
  }

  apiLogger[level](logData, `${emoji} ${method} ${url} - ${status} (${duration}ms)`)
}

/**
 * Log API error
 */
export function logApiError(
  method: string,
  url: string,
  error: Error,
  duration?: number
) {
  apiLogger.error(
    {
      method,
      url,
      error: error.message,
      stack: error.stack,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    },
    `🔴 ${method} ${url} - Error: ${error.message}`
  )
}

/**
 * Queue Logger - Specific logger for queue operations
 */
export const queueLogger = logger.child({ module: 'queue' })

/**
 * Auth Logger - Specific logger for authentication
 */
export const authLogger = logger.child({ module: 'auth' })

/**
 * Get log level based on status code
 */
function getLogLevel(status: number): 'info' | 'warn' | 'error' {
  if (status >= 500) return 'error'
  if (status >= 400) return 'warn'
  return 'info'
}

/**
 * Get emoji based on status code
 */
function getStatusEmoji(status: number): string {
  if (status >= 500) return '🔴'
  if (status >= 400) return '🟡'
  if (status >= 300) return '🔵'
  if (status >= 200) return '✅'
  return '⚪'
}

/**
 * Development-only logger
 */
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(args)
  }
}
