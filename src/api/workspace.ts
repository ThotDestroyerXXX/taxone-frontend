import apiClient from './axios'
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
  WorkspaceInvitationResponse,
  WorkspaceMemberResponse,
} from '@/types/workspace'
import type { ProjectResponse } from '@/types/project'
import type { LabelResponse } from '@/types/label'

/**
 * Workspace API endpoints
 */
export const workspaceApi = {
  /**
   * Get all workspaces
   */
  getAll: async (): Promise<WorkspaceResponse[]> => {
    const response = await apiClient.get<WorkspaceResponse[]>('/workspaces')
    return response.data
  },

  /**
   * Get a single workspace by ID
   */
  getById: async (id: string): Promise<WorkspaceResponse> => {
    const response = await apiClient.get<WorkspaceResponse>(`/workspaces/${id}`)
    return response.data
  },

  /**
   * Create a new workspace
   */
  create: async (data: CreateWorkspaceRequest): Promise<WorkspaceResponse> => {
    const response = await apiClient.post<WorkspaceResponse>('/workspaces', data)
    return response.data
  },

  /**
   * Update a workspace
   */
  update: async (id: string, data: UpdateWorkspaceRequest): Promise<WorkspaceResponse> => {
    const response = await apiClient.put<WorkspaceResponse>(`/workspaces/${id}`, data)
    return response.data
  },

  /**
   * Delete a workspace
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${id}`)
  },

  /**
   * Restore a deleted workspace
   */
  restore: async (id: string): Promise<WorkspaceResponse> => {
    const response = await apiClient.patch<WorkspaceResponse>(`/workspaces/${id}/restore`)
    return response.data
  },

  // Members Management

  /**
   * Get all members of a workspace
   */
  getMembers: async (workspaceId: string): Promise<WorkspaceMemberResponse[]> => {
    const response = await apiClient.get<WorkspaceMemberResponse[]>(
      `/workspaces/${workspaceId}/members`,
    )
    return response.data
  },

  /**
   * Get a specific member
   */
  getMember: async (workspaceId: string, memberId: string): Promise<WorkspaceMemberResponse> => {
    const response = await apiClient.get<WorkspaceMemberResponse>(
      `/workspaces/${workspaceId}/members/${memberId}`,
    )
    return response.data
  },

  /**
   * Invite a member to workspace
   */
  inviteMember: async (
    workspaceId: string,
    data: { email: string; memberType: string },
  ): Promise<WorkspaceInvitationResponse> => {
    const response = await apiClient.post<WorkspaceInvitationResponse>(
      `/workspaces/${workspaceId}/members`,
      data,
    )
    return response.data
  },

  /**
   * Update member role
   */
  updateMemberRole: async (
    workspaceId: string,
    memberId: string,
    data: { memberType: string },
  ): Promise<WorkspaceMemberResponse> => {
    const response = await apiClient.patch<WorkspaceMemberResponse>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      data,
    )
    return response.data
  },

  /**
   * Remove a member from workspace
   */
  deleteMember: async (workspaceId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`)
  },

  // Invitations Management

  /**
   * Get pending invitations
   */
  getPendingInvitations: async (workspaceId: string): Promise<WorkspaceInvitationResponse[]> => {
    const response = await apiClient.get<WorkspaceInvitationResponse[]>(
      `/workspaces/${workspaceId}/invitations`,
    )
    return response.data
  },

  /**
   * Cancel an invitation
   */
  cancelInvitation: async (workspaceId: string, invitationId: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`)
  },

  // Projects Management

  /**
   * Create a project in workspace
   */
  createProject: async (
    workspaceId: string,
    data: {
      name: string
      description: string
      projectKey: string
      priority: string
      color: string
      startDate: string
      endDate: string
      isPublic: boolean
    },
  ): Promise<ProjectResponse> => {
    const response = await apiClient.post<ProjectResponse>(
      `/workspaces/${workspaceId}/projects`,
      data,
    )
    return response.data
  },

  /**
   * Get all projects in workspace
   */
  getProjects: async (workspaceId: string): Promise<ProjectResponse[]> => {
    const response = await apiClient.get<ProjectResponse[]>(`/workspaces/${workspaceId}/projects`)
    return response.data
  },

  // Labels Management

  /**
   * Create a label in workspace
   */
  createLabel: async (
    workspaceId: string,
    data: {
      name: string
      color: string
      description: string
    },
  ): Promise<LabelResponse> => {
    const response = await apiClient.post<LabelResponse>(`/workspaces/${workspaceId}/labels`, data)
    return response.data
  },

  /**
   * Get all labels in workspace
   */
  getLabels: async (workspaceId: string): Promise<LabelResponse[]> => {
    const response = await apiClient.get<LabelResponse[]>(`/workspaces/${workspaceId}/labels`)
    return response.data
  },
}
