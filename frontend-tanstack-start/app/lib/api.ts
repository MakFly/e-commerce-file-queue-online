import { API_BASE_URL } from './constants'
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  QueueStatus,
  QueueStats,
  Product,
  Order,
  CreateOrderData,
  AdminStats,
  ApiError,
} from '~/types'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: response.statusText,
        }))
        throw new Error(error.message || 'API request failed')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  private getAuthHeader(token?: string): Record<string, string> {
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  }

  // Auth API
  async login(credentials: LoginCredentials): Promise<User & AuthTokens> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(data: RegisterData): Promise<User & AuthTokens> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMe(token: string): Promise<User> {
    return this.request('/api/auth/me', {
      headers: this.getAuthHeader(token),
    })
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.request('/api/auth/token/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  async logout(token: string, refreshToken: string): Promise<void> {
    return this.request('/api/auth/logout', {
      method: 'POST',
      headers: this.getAuthHeader(token),
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  // Queue API
  async getQueueStatus(sessionId: string): Promise<QueueStatus> {
    return this.request(`/api/queue/status?session_id=${sessionId}`, {
      headers: { 'X-Session-Id': sessionId },
    })
  }

  async sendHeartbeat(sessionId: string): Promise<{ status: string }> {
    return this.request('/api/queue/heartbeat', {
      method: 'POST',
      headers: { 'X-Session-Id': sessionId },
      body: JSON.stringify({ session_id: sessionId }),
    })
  }

  async releaseSession(sessionId: string): Promise<{ status: string }> {
    return this.request('/api/queue/release', {
      method: 'POST',
      headers: { 'X-Session-Id': sessionId },
      body: JSON.stringify({ session_id: sessionId }),
    })
  }

  async getQueueStats(): Promise<QueueStats> {
    return this.request('/api/queue/stats')
  }

  // Products API
  async getProducts(token?: string): Promise<{ products: Product[] }> {
    return this.request('/api/products', {
      headers: token ? this.getAuthHeader(token) : {},
    })
  }

  async getProduct(id: number, token?: string): Promise<Product> {
    return this.request(`/api/products/${id}`, {
      headers: token ? this.getAuthHeader(token) : {},
    })
  }

  // Orders API
  async createOrder(
    data: CreateOrderData,
    token: string
  ): Promise<Order> {
    return this.request('/api/orders', {
      method: 'POST',
      headers: this.getAuthHeader(token),
      body: JSON.stringify(data),
    })
  }

  async getOrders(token: string): Promise<{ orders: Order[] }> {
    return this.request('/api/orders', {
      headers: this.getAuthHeader(token),
    })
  }

  async getOrder(id: number, token: string): Promise<Order> {
    return this.request(`/api/orders/${id}`, {
      headers: this.getAuthHeader(token),
    })
  }

  // Admin API
  async getAdminStats(token: string): Promise<AdminStats> {
    return this.request('/api/admin/stats', {
      headers: this.getAuthHeader(token),
    })
  }

  async kickUser(sessionId: string, token: string): Promise<void> {
    return this.request('/api/admin/kick-user', {
      method: 'POST',
      headers: this.getAuthHeader(token),
      body: JSON.stringify({ session_id: sessionId }),
    })
  }

  async clearQueue(token: string): Promise<void> {
    return this.request('/api/admin/clear-queue', {
      method: 'POST',
      headers: this.getAuthHeader(token),
    })
  }

  async toggleQueue(enabled: boolean, token: string): Promise<void> {
    return this.request('/api/admin/toggle-queue', {
      method: 'POST',
      headers: this.getAuthHeader(token),
      body: JSON.stringify({ enabled }),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
