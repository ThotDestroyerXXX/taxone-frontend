import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/error'
import { toast } from 'vue-sonner'

/**
 * Check if error is an Axios error with ApiErrorResponse
 */
export function isApiError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    error instanceof AxiosError &&
    error.response?.data !== undefined &&
    typeof error.response?.data === 'object' &&
    'message' in error.response.data
  )
}

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An error occurred'): string {
  if (isApiError(error)) {
    const apiError = error.response?.data

    // If there are field-specific errors, format them
    if (apiError?.errors && apiError.errors.length > 0) {
      const fieldMessages = apiError.errors.map((e) => `${e.field}: ${e.message}`).join(', ')
      return apiError.message ? `${apiError.message} - ${fieldMessages}` : fieldMessages
    }

    toast.error(apiError?.message || fallbackMessage)

    // Return the main error message
    return apiError?.message || fallbackMessage
  }

  // Handle other error types
  if (error instanceof Error) {
    toast.error(error.message)
    return error.message
  }

  toast.error(fallbackMessage)
  return fallbackMessage
}

/**
 * Handle API errors with consistent error extraction
 */
export function handleApiError(error: unknown, fallbackMessage = 'An error occurred'): never {
  const message = getErrorMessage(error, fallbackMessage)
  throw new Error(message)
}
