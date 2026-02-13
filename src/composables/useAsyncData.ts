import { ref, type Ref } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Generic composable for data loading with error handling
 * Provides a consistent pattern for async operations
 */
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  options: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: unknown) => void
    errorMessage?: string
    successMessage?: string
  } = {},
) {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await asyncFn()
      data.value = result

      if (options.successMessage) {
        toast.success(options.successMessage)
      }

      options.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMsg =
        options.errorMessage || (err instanceof Error ? err.message : 'An error occurred')
      error.value = errorMsg
      toast.error(errorMsg)

      options.onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Execute immediately if requested
  if (options.immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute,
    refresh: execute,
  }
}

/**
 * Composable for list data with loading states
 * Common pattern for fetching lists of items
 */
export function useAsyncList<T>(
  fetchFn: () => Promise<T[]>,
  options: {
    immediate?: boolean
    errorMessage?: string
  } = {},
) {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn()
      items.value = result
      return result
    } catch (err) {
      const errorMsg =
        options.errorMessage || (err instanceof Error ? err.message : 'Failed to load data')
      error.value = errorMsg
      toast.error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    items.value = []
    error.value = null
  }

  // Load immediately if requested
  if (options.immediate) {
    load()
  }

  return {
    items,
    loading,
    error,
    load,
    refresh: load,
    clear,
  }
}

/**
 * Composable for handling workspace-dependent data loading
 * Automatically handles workspace availability and changes
 */
export function useWorkspaceGuard(
  workspaceId: Ref<string | null | undefined>,
  options: {
    requiredMessage?: string
    onWorkspaceChange?: (workspaceId: string) => void | Promise<void>
  } = {},
) {
  const hasWorkspace = ref(!!workspaceId.value)

  const requireWorkspace = (): string => {
    if (!workspaceId.value) {
      const message = options.requiredMessage || 'No workspace selected'
      toast.error(message)
      throw new Error(message)
    }
    return workspaceId.value
  }

  return {
    hasWorkspace,
    requireWorkspace,
  }
}
