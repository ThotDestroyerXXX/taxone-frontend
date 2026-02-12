// Workspace Permissions
export enum WorkspacePermission {
  WORKSPACE_VIEW = 'WORKSPACE_VIEW',
  WORKSPACE_DELETE = 'WORKSPACE_DELETE',
  WORKSPACE_UPDATE = 'WORKSPACE_UPDATE',
  WORKSPACE_CREATE = 'WORKSPACE_CREATE',
  WORKSPACE_ARCHIVE = 'WORKSPACE_ARCHIVE',
  WORKSPACE_RESTORE = 'WORKSPACE_RESTORE',

  MEMBER_VIEW = 'MEMBER_VIEW',
  MEMBER_INVITE = 'MEMBER_INVITE',
  MEMBER_DELETE = 'MEMBER_DELETE',
  MEMBER_UPDATE = 'MEMBER_UPDATE',

  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_VIEW = 'PROJECT_VIEW',

  INVITATION_VIEW = 'INVITATION_VIEW',
  INVITATION_CANCEL = 'INVITATION_CANCEL',
}

// Project Permissions
export enum ProjectPermission {
  PROJECT_VIEW = 'PROJECT_VIEW',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  PROJECT_ARCHIVE = 'PROJECT_ARCHIVE',
  PROJECT_RESTORE = 'PROJECT_RESTORE',

  MEMBER_VIEW = 'MEMBER_VIEW',
  MEMBER_INVITE = 'MEMBER_INVITE',
  MEMBER_REMOVE = 'MEMBER_REMOVE',
  MEMBER_UPDATE = 'MEMBER_UPDATE',

  TASK_CREATE = 'TASK_CREATE',
  TASK_VIEW = 'TASK_VIEW',
  TASK_UPDATE = 'TASK_UPDATE',
  TASK_DELETE = 'TASK_DELETE',
  TASK_ASSIGN = 'TASK_ASSIGN',
  TASK_UNASSIGN = 'TASK_UNASSIGN',

  LABEL_CREATE = 'LABEL_CREATE',
  LABEL_VIEW = 'LABEL_VIEW',
  LABEL_DELETE = 'LABEL_DELETE',
  LABEL_UPDATE = 'LABEL_UPDATE',

  INVITATION_VIEW = 'INVITATION_VIEW',
  INVITATION_CANCEL = 'INVITATION_CANCEL',
}

// Workspace Member Types with their permissions
export enum WorkspaceMemberType {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export const WORKSPACE_PERMISSIONS: Record<WorkspaceMemberType, Set<WorkspacePermission>> = {
  [WorkspaceMemberType.OWNER]: new Set(Object.values(WorkspacePermission)),
  [WorkspaceMemberType.ADMIN]: new Set([
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.WORKSPACE_UPDATE,
    WorkspacePermission.MEMBER_VIEW,
    WorkspacePermission.MEMBER_INVITE,
    WorkspacePermission.MEMBER_DELETE,
    WorkspacePermission.MEMBER_UPDATE,
    WorkspacePermission.PROJECT_CREATE,
    WorkspacePermission.PROJECT_VIEW,
    WorkspacePermission.INVITATION_VIEW,
    WorkspacePermission.INVITATION_CANCEL,
  ]),
  [WorkspaceMemberType.MEMBER]: new Set([
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.MEMBER_VIEW,
    WorkspacePermission.PROJECT_VIEW,
    WorkspacePermission.INVITATION_VIEW,
  ]),
  [WorkspaceMemberType.VIEWER]: new Set([
    WorkspacePermission.WORKSPACE_VIEW,
    WorkspacePermission.MEMBER_VIEW,
    WorkspacePermission.PROJECT_VIEW,
  ]),
}

// Project Member Types with their permissions
export enum ProjectMemberType {
  PROJECT_LEAD = 'PROJECT_LEAD',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export const PROJECT_PERMISSIONS: Record<ProjectMemberType, Set<ProjectPermission>> = {
  [ProjectMemberType.PROJECT_LEAD]: new Set(Object.values(ProjectPermission)),
  [ProjectMemberType.CONTRIBUTOR]: new Set([
    ProjectPermission.PROJECT_VIEW,
    ProjectPermission.MEMBER_VIEW,
    ProjectPermission.MEMBER_INVITE,
    ProjectPermission.TASK_CREATE,
    ProjectPermission.TASK_VIEW,
    ProjectPermission.TASK_UPDATE,
    ProjectPermission.TASK_DELETE,
    ProjectPermission.TASK_ASSIGN,
    ProjectPermission.TASK_UNASSIGN,
    ProjectPermission.LABEL_VIEW,
    ProjectPermission.INVITATION_VIEW,
    ProjectPermission.INVITATION_CANCEL,
  ]),
  [ProjectMemberType.VIEWER]: new Set([
    ProjectPermission.PROJECT_VIEW,
    ProjectPermission.MEMBER_VIEW,
    ProjectPermission.TASK_VIEW,
    ProjectPermission.LABEL_VIEW,
  ]),
}

// Helper functions
export function hasWorkspacePermission(
  memberType: WorkspaceMemberType | string | null | undefined,
  permission: WorkspacePermission,
): boolean {
  if (!memberType) return false
  const type = memberType as WorkspaceMemberType
  return WORKSPACE_PERMISSIONS[type]?.has(permission) ?? false
}

export function hasProjectPermission(
  memberType: ProjectMemberType | string | null | undefined,
  permission: ProjectPermission,
): boolean {
  if (!memberType) return false
  const type = memberType as ProjectMemberType
  return PROJECT_PERMISSIONS[type]?.has(permission) ?? false
}

export function isWorkspaceMemberHigherThan(
  memberType: WorkspaceMemberType,
  otherType: WorkspaceMemberType,
): boolean {
  const order = [
    WorkspaceMemberType.OWNER,
    WorkspaceMemberType.ADMIN,
    WorkspaceMemberType.MEMBER,
    WorkspaceMemberType.VIEWER,
  ]
  return order.indexOf(memberType) < order.indexOf(otherType)
}

export function isProjectMemberHigherThan(
  memberType: ProjectMemberType,
  otherType: ProjectMemberType,
): boolean {
  const order = [
    ProjectMemberType.PROJECT_LEAD,
    ProjectMemberType.CONTRIBUTOR,
    ProjectMemberType.VIEWER,
  ]
  return order.indexOf(memberType) < order.indexOf(otherType)
}
