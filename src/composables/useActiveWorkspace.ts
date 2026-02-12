import { ref } from 'vue'
import type { WorkspaceResponse } from '@/types/workspace'

/**
 * Shared state for active workspace across components
 */
const activeWorkspace = ref<WorkspaceResponse | null>(null)

export function useActiveWorkspace() {
  const setActiveWorkspace = (workspace: WorkspaceResponse | null) => {
    activeWorkspace.value = workspace

    // Store in localStorage for persistence
    if (workspace) {
      localStorage.setItem('activeWorkspaceId', workspace.id)
    } else {
      localStorage.removeItem('activeWorkspaceId')
    }
  }

  const getActiveWorkspaceId = () => {
    return activeWorkspace.value?.id || localStorage.getItem('activeWorkspaceId')
  }

  return {
    activeWorkspace,
    setActiveWorkspace,
    getActiveWorkspaceId,
  }
}
