import { onMounted, watch, computed, type Ref } from 'vue'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/stores/workspace'

/**
 * Composable for consistent workspace-dependent view initialization
 * Handles the common pattern of loading workspace data with proper error handling
 */
export function useWorkspaceView<T>(
  dataRef: Ref<T[]>,
  loadingRef: Ref<boolean>,
  loadDataFn: (workspaceId: string) => Promise<T[]>,
  options: {
    errorMessage?: string
    clearOnWorkspaceChange?: boolean
  } = {},
) {
  const workspaceStore = useWorkspaceStore()
  const workspace = computed(() => workspaceStore.activeWorkspace)

  const loadData = async () => {
    if (!workspace.value) {
      toast.error('No workspace selected')
      return
    }

    loadingRef.value = true
    try {
      const data = await loadDataFn(workspace.value.id)
      dataRef.value = data
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error(options.errorMessage || 'Failed to load data')
    } finally {
      loadingRef.value = false
    }
  }

  onMounted(async () => {
    // Ensure workspace is loaded
    if (!workspace.value && !workspaceStore.isInitialized) {
      try {
        await workspaceStore.fetchWorkspaces()
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)
        toast.error('Failed to load workspace')
        return
      }
    }

    // Load data if workspace is available
    if (workspace.value) {
      await loadData()
    }
  })

  // Watch for workspace changes and reload data
  watch(
    () => workspaceStore.activeWorkspaceId,
    async (newWorkspaceId, oldWorkspaceId) => {
      if (newWorkspaceId && newWorkspaceId !== oldWorkspaceId) {
        await loadData()
      } else if (!newWorkspaceId && options.clearOnWorkspaceChange) {
        dataRef.value = [] as T[]
      }
    },
  )

  return {
    workspace,
    loadData,
    reload: loadData,
  }
}
