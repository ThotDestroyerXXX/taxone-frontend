import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectApi } from '@/api/project'
import type { ProjectResponse } from '@/types/project'
import type { ProjectFormData } from '@/lib/schemas/ProjectSchema'
import { getErrorMessage } from '@/lib/errorHandler'

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<ProjectResponse[]>([])
  const currentProject = ref<ProjectResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchProjects = async (workspaceId: string) => {
    // Early return if no access token - user is not authenticated
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return []
    }

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

  const createProject = async (workspaceId: string, data: ProjectFormData) => {
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

  const updateProject = async (workspaceId: string, projectId: string, data: ProjectFormData) => {
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

  const clearProjects = () => {
    projects.value = []
    currentProject.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const clearAllData = () => {
    projects.value = []
    currentProject.value = null
    error.value = null
  }

  return {
    // State
    projects,
    currentProject,
    isLoading,
    error,

    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    clearProjects,
    clearError,
    clearAllData,
  }
})
