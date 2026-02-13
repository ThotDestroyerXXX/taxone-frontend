export interface NotificationResponse {
  id: string
  message: string
  isRead: boolean
  type: string
  createdAt?: string
  relatedEntityId?: string
  relatedEntityType?: string
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'PROJECT_UPDATED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'WORKSPACE_INVITATION'
  | 'COMMENT_ADDED'
  | 'GENERAL'
