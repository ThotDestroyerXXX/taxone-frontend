import type { LabelResponse } from './label'
import type { UserResponse } from './user'

export interface TaskResponse {
  id: string
  reporter: UserResponse
  assignees: UserResponse[]
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  labels: LabelResponse[]
  parentTask?: TaskResponse
  taskKey: string
  estimatedHours: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}
