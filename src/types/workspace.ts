import type { UserResponse } from './user'

export interface WorkspaceResponse {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  owner: UserResponse
  slug: string
  logoUrl?: string
  isActive: boolean
  // Add other workspace properties as needed
}

export interface WorkspacesResponse {
  workspaces: WorkspaceResponse[]
  total: number
}

export interface CreateWorkspaceRequest {
  name: string
  description: string
  slug: string
  logoUrl?: string
}

export interface UpdateWorkspaceRequest {
  name: string
  description: string
  slug: string
  logoUrl?: string
}

export interface WorkspaceInvitationResponse {
  id: string
  email: string
  invitedBy: UserResponse
  memberType: string
  status: string
}

export interface WorkspaceMemberResponse {
  id: string
  user: UserResponse
  memberType: string
  invitedBy: UserResponse
  addedBy: UserResponse
  joinedAt: string
}
