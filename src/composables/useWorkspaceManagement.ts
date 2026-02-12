import { ref } from 'vue'
import { workspaceApi } from '@/api/workspace'
import type {
  WorkspaceResponse,
  WorkspaceMemberResponse,
  WorkspaceInvitationResponse,
} from '@/types/workspace'
import type { ProjectResponse } from '@/types/project'
import type { LabelResponse } from '@/types/label'

export function useWorkspaceManagement(workspaceId?: string) {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Workspace CRUD
  const createWorkspace = async (data: {
    name: string
    description: string
    slug: string
    logoUrl?: string
  }): Promise<WorkspaceResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const workspace = await workspaceApi.create(data)
      return workspace
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWorkspace = async (
    id: string,
    data: {
      name: string
      description: string
      slug: string
      logoUrl?: string
    },
  ): Promise<WorkspaceResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const workspace = await workspaceApi.update(id, data)
      return workspace
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWorkspace = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await workspaceApi.delete(id)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const restoreWorkspace = async (id: string): Promise<WorkspaceResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const workspace = await workspaceApi.restore(id)
      return workspace
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // Members Management
  const getMembers = async (id?: string): Promise<WorkspaceMemberResponse[]> => {
    if (!id && !workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const members = await workspaceApi.getMembers(id || workspaceId!)
      return members
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const inviteMember = async (data: {
    email: string
    memberType: string
  }): Promise<WorkspaceInvitationResponse | null> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const invitation = await workspaceApi.inviteMember(workspaceId, data)
      return invitation
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMemberRole = async (
    memberId: string,
    data: { memberType: string },
  ): Promise<WorkspaceMemberResponse | null> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const member = await workspaceApi.updateMemberRole(workspaceId, memberId, data)
      return member
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMember = async (userId: string): Promise<void> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      await workspaceApi.deleteMember(workspaceId, userId)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // Invitations Management
  const getPendingInvitations = async (): Promise<WorkspaceInvitationResponse[]> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const invitations = await workspaceApi.getPendingInvitations(workspaceId)
      return invitations
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelInvitation = async (invitationId: string): Promise<void> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      await workspaceApi.cancelInvitation(workspaceId, invitationId)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // Projects Management
  const createProject = async (data: {
    name: string
    description: string
    projectKey: string
    priority: string
    color: string
    startDate: string
    endDate: string
    isPublic: boolean
  }): Promise<ProjectResponse | null> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const project = await workspaceApi.createProject(workspaceId, data)
      return project
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const getProjects = async (): Promise<ProjectResponse[]> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const projects = await workspaceApi.getProjects(workspaceId)
      return projects
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // Labels Management
  const createLabel = async (data: {
    name: string
    color: string
    description: string
  }): Promise<LabelResponse | null> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const label = await workspaceApi.createLabel(workspaceId, data)
      return label
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const getLabels = async (): Promise<LabelResponse[]> => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    loading.value = true
    error.value = null
    try {
      const labels = await workspaceApi.getLabels(workspaceId)
      return labels
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    // Workspace
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    restoreWorkspace,
    // Members
    getMembers,
    inviteMember,
    updateMemberRole,
    deleteMember,
    // Invitations
    getPendingInvitations,
    cancelInvitation,
    // Projects
    createProject,
    getProjects,
    // Labels
    createLabel,
    getLabels,
  }
}
