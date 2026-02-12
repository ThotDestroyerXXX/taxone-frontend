import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import type { LoginRequest, RegisterRequest } from '@/types/auth'
import { getErrorMessage } from '@/lib/errorHandler'
import type { UserResponse } from '@/types/user'

const currentUser = ref<UserResponse | null>(authApi.getStoredUser())
const isAuthenticated = ref(authApi.isAuthenticated())

/**
 * Composable for authentication state and methods
 * Provides reactive authentication state across components
 */
export function useAuth() {
  const router = useRouter()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Login user
   */
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      isAuthenticated.value = true
      return response
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to login')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.register(userData)
      return response
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to register')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await authApi.logout()
      currentUser.value = null
      isAuthenticated.value = false
      router.push('/login')
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to logout')
      // Still clear local state even if API call fails
      currentUser.value = null
      isAuthenticated.value = false
      router.push('/login')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch current user profile
   */
  const fetchCurrentUser = async () => {
    isLoading.value = true
    error.value = null

    try {
      const user = await authApi.getCurrentUser()
      currentUser.value = user
      isAuthenticated.value = true
      return user
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch user')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    currentUser: computed(() => currentUser.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Methods
    login,
    register,
    logout,
    fetchCurrentUser,
  }
}
