// User & Auth Types
export type User = {
  id: number
  email: string
  name: string
  role: 'user' | 'admin'
  avatar?: string
  createdAt?: string
}

export type AuthTokens = {
  token: string
  refresh_token: string
  refresh_token_expiration?: number
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  email: string
  password: string
  name: string
}

// Queue Types
export type QueueStatus = {
  status: 'active' | 'waiting'
  position?: number
  queue_length?: number
  estimated_wait_seconds?: number
  active_users: number
  max_users: number
}

export type QueueStats = {
  active_users: number
  waiting_users: number
  max_concurrent_users: number
  queue_enabled: boolean
}

// Product Types
export type Product = {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  active: boolean
  created_at?: string
  updated_at?: string
}

// Order Types
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export type OrderItem = {
  id: number
  product_name: string
  quantity: number
  price: number
}

export type Order = {
  id: number
  order_number: string
  user_id: number
  status: OrderStatus
  total: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export type CreateOrderData = {
  items: Array<{
    product_id: number
    quantity: number
  }>
}

// Admin Types
export type AdminUser = {
  session_id: string
  email?: string
  joined_at: string
  last_heartbeat: string
}

export type AdminStats = {
  active_users: number
  waiting_users: number
  queue_enabled: boolean
  max_concurrent_users: number
  total_sessions_today?: number
  avg_wait_time?: number
}

// API Response Types
export type ApiResponse<T = unknown> = {
  data?: T
  error?: string
  message?: string
}

export type ApiError = {
  message: string
  errors?: Record<string, string[]>
}
