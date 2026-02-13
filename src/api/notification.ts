import apiClient from './axios'
import type { NotificationResponse } from '@/types/notification'

/**
 * Notification API endpoints
 */
export const notificationApi = {
  /**
   * Get all notifications for the current user
   */
  getAll: async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<NotificationResponse[]>('/notifications')
    return response.data
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/notifications/unread/count')
    return response.data
  },

  /**
   * Get a single notification by ID
   */
  getById: async (notificationId: string): Promise<NotificationResponse> => {
    const response = await apiClient.get<NotificationResponse>(`/notifications/${notificationId}`)
    return response.data
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.patch<number>('/notifications/mark-all-read')
    return response.data
  },

  /**
   * Delete a notification
   */
  delete: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`)
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<void> => {
    await apiClient.delete('/notifications/clear-all')
  },
}
