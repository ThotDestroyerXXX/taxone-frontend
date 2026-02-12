import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { LoginRequest, RegisterRequest } from '@/types/auth'
import type { UserResponse } from '@/types/user'
import { getErrorMessage } from '@/lib/errorHandler'
import { useWorkspaceStore } from './workspace'
import { useProjectStore } from './project'
import { useTaskStore } from './task'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // State
    const user = ref<UserResponse | null>(authApi.getStoredUser())
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Getters - isAuthenticated checks for actual token, not persisted state
    const isAuthenticated = computed(() => {
      const token = localStorage.getItem('accessToken')
      // User is authenticated if token exists
      // User data might not be loaded yet but that's okay for navigation
      return !!token
    })
    const userName = computed(() => {
      if (!user.value) return ''
      return `${user.value.firstName} ${user.value.lastName}`.trim()
    })
    const userEmail = computed(() => user.value?.email || '')
    const userId = computed(() => user.value?.id || '')

    // Actions
    const login = async (credentials: LoginRequest) => {
      isLoading.value = true
      error.value = null

      try {
        // Step 1: Login to get token
        const authResponse = await authApi.login(credentials)

        // Step 2: Fetch user profile using the token
        const userData = await authApi.getCurrentUser()

        // Step 3: Store user data
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))

        return { user: userData, token: authResponse.token }
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Login failed')
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const register = async (userData: RegisterRequest) => {
      isLoading.value = true
      error.value = null

      try {
        const response = await authApi.register(userData)
        return response
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Registration failed')
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const logout = async () => {
      isLoading.value = true
      error.value = null

      try {
        await authApi.logout()
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Logout failed')
        // Continue with logout even if API call fails
      } finally {
        // Clear all auth state
        user.value = null
        isLoading.value = false

        // Clear tokens from localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        // Clear other stores
        const workspaceStore = useWorkspaceStore()
        const projectStore = useProjectStore()
        const taskStore = useTaskStore()
        workspaceStore.clearAllData()
        projectStore.clearAllData()
        taskStore.clearAllData()
      }
    }

    const fetchProfile = async () => {
      isLoading.value = true
      error.value = null

      try {
        const userData = await authApi.getCurrentUser()
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
        return userData
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Failed to fetch profile')
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const refreshToken = async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken')
        if (!storedRefreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await authApi.refreshToken(storedRefreshToken)
        return response
      } catch (err: unknown) {
        // Token refresh failed, clear user state
        user.value = null
        throw err
      }
    }

    const clearError = () => {
      error.value = null
    }

    const clearAllData = () => {
      user.value = null
      error.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }

    return {
      // State
      user,
      isAuthenticated,
      isLoading,
      error,

      // Getters
      userName,
      userEmail,
      userId,

      // Actions
      login,
      register,
      logout,
      fetchProfile,
      refreshToken,
      clearError,
      clearAllData,
    }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
