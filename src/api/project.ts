import apiClient from './axios'
import type { ProjectResponse } from '@/types/project'

/**
 * Project API endpoints
 */
export const projectApi = {
  /**
   * Get all projects for a workspace
   */
  getByWorkspace: async (workspaceId: string): Promise<ProjectResponse[]> => {
    const response = await apiClient.get<ProjectResponse[]>(`/workspaces/${workspaceId}/projects`)
    return response.data
  },

  /**
   * Get a single project by ID
   */
  getById: async (workspaceId: string, projectId: string): Promise<ProjectResponse> => {
    const response = await apiClient.get<ProjectResponse>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
    )
    return response.data
  },

  /**
   * Create a new project
   */
  create: async (workspaceId: string, data: any): Promise<ProjectResponse> => {
    const response = await apiClient.post<ProjectResponse>(
      `/workspaces/${workspaceId}/projects`,
      data,
    )
    return response.data
  },

  /**
   * Update a project
   */
  update: async (workspaceId: string, projectId: string, data: any): Promise<ProjectResponse> => {
    const response = await apiClient.put<ProjectResponse>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
      data,
    )
    return response.data
  },

  /**
   * Delete a project
   */
  delete: async (workspaceId: string, projectId: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}`)
  },
}
