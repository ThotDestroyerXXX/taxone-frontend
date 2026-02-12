import apiClient from './axios'
import type { TaskResponse } from '@/types/task'

/**
 * Task API endpoints
 */
export const taskApi = {
  /**
   * Get all tasks for a project
   */
  getByProject: async (projectId: string): Promise<TaskResponse[]> => {
    const response = await apiClient.get<TaskResponse[]>(`/projects/${projectId}/tasks`)
    return response.data
  },

  /**
   * Get a single task by ID
   */
  getById: async (projectId: string, taskId: string): Promise<TaskResponse> => {
    const response = await apiClient.get<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`)
    return response.data
  },

  /**
   * Create a new task
   */
  create: async (projectId: string, data: any): Promise<TaskResponse> => {
    const response = await apiClient.post<TaskResponse>(`/projects/${projectId}/tasks`, data)
    return response.data
  },

  /**
   * Update a task
   */
  update: async (projectId: string, taskId: string, data: any): Promise<TaskResponse> => {
    const response = await apiClient.put<TaskResponse>(
      `/projects/${projectId}/tasks/${taskId}`,
      data,
    )
    return response.data
  },

  /**
   * Delete a task
   */
  delete: async (projectId: string, taskId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`)
  },
}
