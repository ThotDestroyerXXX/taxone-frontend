import type { UserResponse } from './user'

export interface ProjectResponse {
  id: string
  owner: UserResponse
  name: string
  description: string
  projectKey: string
  status: string
  priority: string
  color: string
  startDate: string
  endDate: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectInvitationResponse {
  id: string
  email: string
  invitedBy: UserResponse
  memberType: string
  status: string
}

export interface ProjectMemberResponse {
  id: string
  user: UserResponse
  memberType: string
  addedBy: UserResponse
  addedAt: string
}
