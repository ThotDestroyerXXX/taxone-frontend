import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskApi } from '@/api/task'
import type { TaskResponse } from '@/types/task'
import { getErrorMessage } from '@/lib/errorHandler'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<TaskResponse[]>([])
  const currentTask = ref<TaskResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchTasks = async (projectId: string) => {
    // Early return if no access token - user is not authenticated
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await taskApi.getByProject(projectId)
      tasks.value = data
      return data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch tasks')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchTask = async (projectId: string, taskId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const task = await taskApi.getById(projectId, taskId)
      currentTask.value = task
      return task
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch task')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (projectId: string, data: Record<string, unknown>) => {
    isLoading.value = true
    error.value = null

    try {
      const task = await taskApi.create(projectId, data)
      tasks.value.push(task)
      return task
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create task')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateTask = async (projectId: string, taskId: string, data: Record<string, unknown>) => {
    isLoading.value = true
    error.value = null

    try {
      const task = await taskApi.update(projectId, taskId, data)
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = task
      }
      if (currentTask.value?.id === taskId) {
        currentTask.value = task
      }
      return task
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update task')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteTask = async (projectId: string, taskId: string) => {
    isLoading.value = true
    error.value = null

    try {
      await taskApi.delete(projectId, taskId)
      tasks.value = tasks.value.filter((t) => t.id !== taskId)
      if (currentTask.value?.id === taskId) {
        currentTask.value = null
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to delete task')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearTasks = () => {
    tasks.value = []
    currentTask.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const clearAllData = () => {
    tasks.value = []
    currentTask.value = null
    error.value = null
  }

  return {
    // State
    tasks,
    currentTask,
    isLoading,
    error,

    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    clearTasks,
    clearError,
    clearAllData,
  }
})
