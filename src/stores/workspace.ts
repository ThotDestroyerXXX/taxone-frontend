import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { workspaceApi } from '@/api/workspace'
import type { WorkspaceResponse } from '@/types/workspace'
import { getErrorMessage } from '@/lib/errorHandler'
import type { WorkspaceFormData } from '@/lib/schemas/WorkspaceSchema'

export const useWorkspaceStore = defineStore(
  'workspace',
  () => {
    // State
    const workspaces = ref<WorkspaceResponse[]>([])
    const activeWorkspace = ref<WorkspaceResponse | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isInitialized = ref(false) // Track if workspaces have been fetched this session

    // Getters
    const activeWorkspaceId = computed(() => activeWorkspace.value?.id || null)
    const hasWorkspaces = computed(() => workspaces.value.length > 0)
    const hasActiveWorkspace = computed(() => !!activeWorkspace.value)

    // Actions
    const fetchWorkspaces = async () => {
      // Early return if no access token - user is not authenticated
      const token = localStorage.getItem('accessToken')
      if (!token) {
        return []
      }

      isLoading.value = true
      error.value = null

      try {
        const data = await workspaceApi.getAll()
        workspaces.value = data

        // Auto-select first workspace if none selected
        if (!activeWorkspace.value && data.length > 0) {
          activeWorkspace.value = data[0]!
        } else if (activeWorkspace.value) {
          // Verify current selection is still valid
          const isValid = data.some((w) => w.id === activeWorkspace.value?.id)
          if (!isValid && data.length > 0) {
            activeWorkspace.value = data[0]!
          }
        }

        isInitialized.value = true
        return data
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Failed to fetch workspaces')
        activeWorkspace.value = null
        isInitialized.value = false
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const setActiveWorkspace = (workspace: WorkspaceResponse | null) => {
      activeWorkspace.value = workspace
    }

    const setActiveWorkspaceById = (workspaceId: string) => {
      const workspace = workspaces.value.find((w) => w.id === workspaceId)
      if (workspace) {
        activeWorkspace.value = workspace
      }
    }

    const createWorkspace = async (data: WorkspaceFormData) => {
      isLoading.value = true
      error.value = null

      try {
        const workspace = await workspaceApi.create(data)
        workspaces.value.push(workspace)

        // Auto-select newly created workspace
        activeWorkspace.value = workspace

        return workspace
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Failed to create workspace')
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const updateWorkspace = async (id: string, data: WorkspaceFormData) => {
      isLoading.value = true
      error.value = null

      try {
        const workspace = await workspaceApi.update(id, data)
        const index = workspaces.value.findIndex((w) => w.id === id)
        if (index !== -1) {
          workspaces.value[index] = workspace
        }
        if (activeWorkspace.value?.id === id) {
          activeWorkspace.value = workspace
        }
        return workspace
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Failed to update workspace')
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const deleteWorkspace = async (id: string) => {
      isLoading.value = true
      error.value = null

      try {
        await workspaceApi.delete(id)
        workspaces.value = workspaces.value.filter((w) => w.id !== id)

        // Clear active workspace if deleted
        if (activeWorkspace.value?.id === id) {
          activeWorkspace.value = workspaces.value.length > 0 ? workspaces.value[0]! : null
        }
      } catch (err: unknown) {
        error.value = getErrorMessage(err, 'Failed to delete workspace')
        throw err
      } finally {
        isLoading.value = false
      }
    }

    const clearError = () => {
      error.value = null
    }

    const clearAllData = () => {
      workspaces.value = []
      activeWorkspace.value = null
      error.value = null
      isInitialized.value = false
    }

    return {
      // State
      workspaces,
      activeWorkspace,
      isLoading,
      error,
      isInitialized,

      // Getters
      activeWorkspaceId,
      hasWorkspaces,
      hasActiveWorkspace,

      // Actions
      fetchWorkspaces,
      setActiveWorkspace,
      setActiveWorkspaceById,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      clearError,
      clearAllData,
    }
  },
  // No persistence - fresh workspace selection each session
  // This prevents stale workspace data between user sessions
)
