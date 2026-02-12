import apiClient from './axios'
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types/auth'
import type { UserResponse } from '@/types/user'

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)

    // Store tokens in localStorage
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token)
    }

    return response.data
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData)
    return response.data
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })

    // Update tokens in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
    }

    return response.data
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/users/me')
    return response.data
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken')
    return !!token
  },

  /**
   * Get stored access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken')
  },

  /**
   * Get stored user data
   */
  getStoredUser: (): UserResponse | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
}
