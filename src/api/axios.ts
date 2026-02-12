import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'vue-sonner'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't retried yet and we are not in login or register page
    if (
      error.response?.status === 401 &&
      !['/login', '/register'].includes(window.location.pathname) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // No refresh token, redirect to login
          handleLogout()
          return Promise.reject(error)
        }

        // Attempt to refresh the token
        const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // Store new tokens
        localStorage.setItem('accessToken', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        handleLogout()
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data)
      toast.error('You do not have permission to perform this action.')
    }

    return Promise.reject(error)
  },
)

// Helper function to handle logout
function handleLogout() {
  // Clear all localStorage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  // Clear all Pinia persisted stores
  // We need to clear the persisted state keys used by pinia-plugin-persistedstate
  localStorage.removeItem('auth')
  localStorage.removeItem('workspace')
  localStorage.removeItem('project')

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export default apiClient
