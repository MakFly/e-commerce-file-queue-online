// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Queue Configuration
export const QUEUE_POLL_INTERVAL = 5000 // 5 seconds
export const QUEUE_HEARTBEAT_INTERVAL = 60000 // 60 seconds

// Session Storage Keys
export const SESSION_ID_KEY = 'queue_session_id'
export const AUTH_TOKEN_KEY = 'auth_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'E-Commerce Platform'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
