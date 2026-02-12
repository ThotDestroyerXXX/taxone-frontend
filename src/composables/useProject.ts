import { ref } from 'vue'
import { projectApi } from '@/api/project'
import type { ProjectResponse } from '@/types/project'
import { getErrorMessage } from '@/lib/errorHandler'

export function useProject() {
  const projects = ref<ProjectResponse[]>([])
  const currentProject = ref<ProjectResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all projects for a workspace
   */
  const fetchProjects = async (workspaceId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await projectApi.getByWorkspace(workspaceId)
      projects.value = data
      return data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch projects')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single project by ID
   */
  const fetchProject = async (workspaceId: string, projectId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const project = await projectApi.getById(workspaceId, projectId)
      currentProject.value = project
      return project
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch project')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new project
   */
  const createProject = async (workspaceId: string, data: any) => {
    isLoading.value = true
    error.value = null

    try {
      const project = await projectApi.create(workspaceId, data)
      projects.value.push(project)
      return project
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create project')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a project
   */
  const updateProject = async (workspaceId: string, projectId: string, data: any) => {
    isLoading.value = true
    error.value = null

    try {
      const project = await projectApi.update(workspaceId, projectId, data)
      const index = projects.value.findIndex((p) => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = project
      }
      if (currentProject.value?.id === projectId) {
        currentProject.value = project
      }
      return project
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update project')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a project
   */
  const deleteProject = async (workspaceId: string, projectId: string) => {
    isLoading.value = true
    error.value = null

    try {
      await projectApi.delete(workspaceId, projectId)
      projects.value = projects.value.filter((p) => p.id !== projectId)
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to delete project')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  }
}
