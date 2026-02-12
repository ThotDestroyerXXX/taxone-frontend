import { computed, type ComputedRef } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import {
  WorkspacePermission,
  WorkspaceMemberType,
  hasWorkspacePermission,
} from '@/types/permission'

export function useWorkspacePermissions(): {
  currentMemberType: ComputedRef<WorkspaceMemberType | null>
  hasPermission: (permission: WorkspacePermission) => boolean
  canCreateProject: ComputedRef<boolean>
  canInviteMember: ComputedRef<boolean>
  canUpdateWorkspace: ComputedRef<boolean>
  canDeleteWorkspace: ComputedRef<boolean>
  canUpdateMember: ComputedRef<boolean>
  canDeleteMember: ComputedRef<boolean>
  canCancelInvitation: ComputedRef<boolean>
  canArchiveWorkspace: ComputedRef<boolean>
  canRestoreWorkspace: ComputedRef<boolean>
  isOwner: ComputedRef<boolean>
  isAdmin: ComputedRef<boolean>
  isMember: ComputedRef<boolean>
  isViewer: ComputedRef<boolean>
} {
  const workspaceStore = useWorkspaceStore()

  const currentMemberType = computed(() => workspaceStore.currentMemberType)

  const hasPermission = (permission: WorkspacePermission): boolean => {
    return hasWorkspacePermission(currentMemberType.value, permission)
  }

  const canCreateProject = computed(() => hasPermission(WorkspacePermission.PROJECT_CREATE))

  const canInviteMember = computed(() => hasPermission(WorkspacePermission.MEMBER_INVITE))

  const canUpdateWorkspace = computed(() => hasPermission(WorkspacePermission.WORKSPACE_UPDATE))

  const canDeleteWorkspace = computed(() => hasPermission(WorkspacePermission.WORKSPACE_DELETE))

  const canUpdateMember = computed(() => hasPermission(WorkspacePermission.MEMBER_UPDATE))

  const canDeleteMember = computed(() => hasPermission(WorkspacePermission.MEMBER_DELETE))

  const canCancelInvitation = computed(() => hasPermission(WorkspacePermission.INVITATION_CANCEL))

  const canArchiveWorkspace = computed(() => hasPermission(WorkspacePermission.WORKSPACE_ARCHIVE))

  const canRestoreWorkspace = computed(() => hasPermission(WorkspacePermission.WORKSPACE_RESTORE))

  const isOwner = computed(() => currentMemberType.value === WorkspaceMemberType.OWNER)
  const isAdmin = computed(() => currentMemberType.value === WorkspaceMemberType.ADMIN)
  const isMember = computed(() => currentMemberType.value === WorkspaceMemberType.MEMBER)
  const isViewer = computed(() => currentMemberType.value === WorkspaceMemberType.VIEWER)

  return {
    currentMemberType,
    hasPermission,
    canCreateProject,
    canInviteMember,
    canUpdateWorkspace,
    canDeleteWorkspace,
    canUpdateMember,
    canDeleteMember,
    canCancelInvitation,
    canArchiveWorkspace,
    canRestoreWorkspace,
    isOwner,
    isAdmin,
    isMember,
    isViewer,
  }
}
