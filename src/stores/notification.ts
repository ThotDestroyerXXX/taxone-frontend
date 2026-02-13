import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '@/api/notification'
import type { NotificationResponse } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<NotificationResponse[]>([])
  const unreadCount = ref<number>(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const unreadNotifications = computed(() => notifications.value.filter((n) => !n.isRead))

  const readNotifications = computed(() => notifications.value.filter((n) => n.isRead))

  const hasUnread = computed(() => unreadCount.value > 0)

  // Actions
  const fetchNotifications = async () => {
    isLoading.value = true
    error.value = null
    try {
      notifications.value = await notificationApi.getAll()
      return notifications.value
    } catch (err) {
      error.value = 'Failed to fetch notifications'
      console.error('Failed to fetch notifications:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      unreadCount.value = await notificationApi.getUnreadCount()
      return unreadCount.value
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      const count = await notificationApi.markAllAsRead()
      // Update local state
      notifications.value = notifications.value.map((n) => ({
        ...n,
        isRead: true,
      }))
      unreadCount.value = 0
      return count
    } catch (err) {
      error.value = 'Failed to mark all as read'
      console.error('Failed to mark all as read:', err)
      throw err
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationApi.delete(notificationId)
      // Remove from local state
      const notification = notifications.value.find((n) => n.id === notificationId)
      if (notification && !notification.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value = notifications.value.filter((n) => n.id !== notificationId)
    } catch (err) {
      error.value = 'Failed to delete notification'
      console.error('Failed to delete notification:', err)
      throw err
    }
  }

  const clearAll = async () => {
    try {
      await notificationApi.clearAll()
      notifications.value = []
      unreadCount.value = 0
    } catch (err) {
      error.value = 'Failed to clear notifications'
      console.error('Failed to clear notifications:', err)
      throw err
    }
  }

  const addNotification = (notification: NotificationResponse) => {
    notifications.value.unshift(notification)
    if (!notification.isRead) {
      unreadCount.value++
    }
  }

  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find((n) => n.id === notificationId)
    if (notification && !notification.isRead) {
      notification.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
    error.value = null
  }

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    // Computed
    unreadNotifications,
    readNotifications,
    hasUnread,
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    markAsRead,
    clearNotifications,
  }
})
