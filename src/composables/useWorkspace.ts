import { ref } from 'vue'
import { workspaceApi } from '@/api/workspace'
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
} from '@/types/workspace'
import { getErrorMessage } from '@/lib/errorHandler'

export function useWorkspace() {
  const workspaces = ref<WorkspaceResponse[]>([])
  const currentWorkspace = ref<WorkspaceResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all workspaces
   */
  const fetchWorkspaces = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await workspaceApi.getAll()
      workspaces.value = data
      return data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch workspaces')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single workspace by ID
   */
  const fetchWorkspace = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const workspace = await workspaceApi.getById(id)
      currentWorkspace.value = workspace
      return workspace
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch workspace')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new workspace
   */
  const createWorkspace = async (data: CreateWorkspaceRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const workspace = await workspaceApi.create(data)
      workspaces.value.push(workspace)
      return workspace
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create workspace')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a workspace
   */
  const updateWorkspace = async (id: string, data: UpdateWorkspaceRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const workspace = await workspaceApi.update(id, data)
      const index = workspaces.value.findIndex((w: WorkspaceResponse) => w.id === id)
      if (index !== -1) {
        workspaces.value[index] = workspace
      }
      if (currentWorkspace.value?.id === id) {
        currentWorkspace.value = workspace
      }
      return workspace
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update workspace')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a workspace
   */
  const deleteWorkspace = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      await workspaceApi.delete(id)
      workspaces.value = workspaces.value.filter((w: WorkspaceResponse) => w.id !== id)
      if (currentWorkspace.value?.id === id) {
        currentWorkspace.value = null
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to delete workspace')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    fetchWorkspaces,
    fetchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  }
}
