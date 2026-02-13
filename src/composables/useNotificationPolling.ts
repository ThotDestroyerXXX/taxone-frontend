import { onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

/**
 * Composable for polling notifications at regular intervals
 * @param intervalMs - Polling interval in milliseconds (default: 30000 = 30 seconds)
 * @returns Object with start and stop functions
 */
export function useNotificationPolling(intervalMs = 30000) {
  const notificationStore = useNotificationStore()
  let pollInterval: ReturnType<typeof setInterval> | null = null

  const startPolling = () => {
    // Initial fetch
    notificationStore.fetchUnreadCount()

    // Set up interval
    pollInterval = setInterval(() => {
      notificationStore.fetchUnreadCount()
    }, intervalMs)
  }

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  // Auto-start on mount and cleanup on unmount
  onMounted(() => {
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    startPolling,
    stopPolling,
  }
}
