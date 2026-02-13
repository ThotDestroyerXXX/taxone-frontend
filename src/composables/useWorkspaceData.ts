import { watch, onMounted } from 'vue'
import type { Router } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

/**
 * Composable for common workspace initialization patterns
 * Handles workspace loading and error states consistently
 */
export function useWorkspaceInit() {
  const workspaceStore = useWorkspaceStore()
  const authStore = useAuthStore()

  /**
   * Initialize workspace - fetch if not already loaded
   * Returns true if workspace is available
   */
  const initWorkspace = async (): Promise<boolean> => {
    if (!authStore.isAuthenticated) return false

    if (!workspaceStore.isInitialized) {
      try {
        await workspaceStore.fetchWorkspaces()
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)
        toast.error('Failed to load workspace')
        return false
      }
    }

    return workspaceStore.hasActiveWorkspace
  }

  return {
    workspaceStore,
    authStore,
    initWorkspace,
    workspace: () => workspaceStore.activeWorkspace,
    workspaceId: () => workspaceStore.activeWorkspaceId,
    hasWorkspace: () => workspaceStore.hasActiveWorkspace,
    isInitialized: () => workspaceStore.isInitialized,
  }
}

/**
 * Composable for workspace-dependent data loading
 * Automatically loads data when workspace changes
 */
export function useWorkspaceData<T>(
  loadFn: (workspaceId: string) => Promise<T>,
  options: {
    immediate?: boolean
    clearOnChange?: boolean
  } = {},
) {
  const { workspaceStore, initWorkspace } = useWorkspaceInit()

  const loadData = async () => {
    const hasWorkspace = await initWorkspace()
    if (!hasWorkspace) return null

    const workspaceId = workspaceStore.activeWorkspaceId
    if (!workspaceId) return null

    return await loadFn(workspaceId)
  }

  // Watch for workspace changes
  watch(
    () => workspaceStore.activeWorkspaceId,
    async (newId, oldId) => {
      if (newId && newId !== oldId) {
        await loadData()
      }
    },
  )

  // Load on mount if requested
  if (options.immediate) {
    onMounted(() => loadData())
  }

  return {
    loadData,
  }
}

/**
 * Composable for project navigation
 * Provides helper to navigate to project tasks
 */
export function useProjectNavigation() {
  const workspaceStore = useWorkspaceStore()

  const navigateToProject = (router: Router, projectId: string) => {
    const workspaceId = workspaceStore.activeWorkspace?.id
    if (workspaceId) {
      router.push(`/workspace/${workspaceId}/project/${projectId}/tasks`)
    }
  }

  return {
    navigateToProject,
  }
}
