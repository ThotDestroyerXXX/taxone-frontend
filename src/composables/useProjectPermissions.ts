import { computed, type ComputedRef } from 'vue'
import { useProjectStore } from '@/stores/project'
import { ProjectPermission, ProjectMemberType, hasProjectPermission } from '@/types/permission'

export function useProjectPermissions(): {
  currentMemberType: ComputedRef<ProjectMemberType | null>
  hasPermission: (permission: ProjectPermission) => boolean
  canUpdateProject: ComputedRef<boolean>
  canDeleteProject: ComputedRef<boolean>
  canInviteMember: ComputedRef<boolean>
  canUpdateMember: ComputedRef<boolean>
  canRemoveMember: ComputedRef<boolean>
  canCreateTask: ComputedRef<boolean>
  canUpdateTask: ComputedRef<boolean>
  canDeleteTask: ComputedRef<boolean>
  canAssignTask: ComputedRef<boolean>
  canCreateLabel: ComputedRef<boolean>
  canUpdateLabel: ComputedRef<boolean>
  canDeleteLabel: ComputedRef<boolean>
  canCancelInvitation: ComputedRef<boolean>
  canArchiveProject: ComputedRef<boolean>
  canRestoreProject: ComputedRef<boolean>
  isProjectLead: ComputedRef<boolean>
  isContributor: ComputedRef<boolean>
  isViewer: ComputedRef<boolean>
} {
  const projectStore = useProjectStore()

  const currentMemberType = computed(() => projectStore.currentMemberType)

  const hasPermission = (permission: ProjectPermission): boolean => {
    return hasProjectPermission(currentMemberType.value, permission)
  }

  const canUpdateProject = computed(() => hasPermission(ProjectPermission.PROJECT_UPDATE))

  const canDeleteProject = computed(() => hasPermission(ProjectPermission.PROJECT_DELETE))

  const canInviteMember = computed(() => hasPermission(ProjectPermission.MEMBER_INVITE))

  const canUpdateMember = computed(() => hasPermission(ProjectPermission.MEMBER_UPDATE))

  const canRemoveMember = computed(() => hasPermission(ProjectPermission.MEMBER_REMOVE))

  const canCreateTask = computed(() => hasPermission(ProjectPermission.TASK_CREATE))

  const canUpdateTask = computed(() => hasPermission(ProjectPermission.TASK_UPDATE))

  const canDeleteTask = computed(() => hasPermission(ProjectPermission.TASK_DELETE))

  const canAssignTask = computed(() => hasPermission(ProjectPermission.TASK_ASSIGN))

  const canCreateLabel = computed(() => hasPermission(ProjectPermission.LABEL_CREATE))

  const canUpdateLabel = computed(() => hasPermission(ProjectPermission.LABEL_UPDATE))

  const canDeleteLabel = computed(() => hasPermission(ProjectPermission.LABEL_DELETE))

  const canCancelInvitation = computed(() => hasPermission(ProjectPermission.INVITATION_CANCEL))

  const canArchiveProject = computed(() => hasPermission(ProjectPermission.PROJECT_ARCHIVE))

  const canRestoreProject = computed(() => hasPermission(ProjectPermission.PROJECT_RESTORE))

  const isProjectLead = computed(() => currentMemberType.value === ProjectMemberType.PROJECT_LEAD)
  const isContributor = computed(() => currentMemberType.value === ProjectMemberType.CONTRIBUTOR)
  const isViewer = computed(() => currentMemberType.value === ProjectMemberType.VIEWER)

  return {
    currentMemberType,
    hasPermission,
    canUpdateProject,
    canDeleteProject,
    canInviteMember,
    canUpdateMember,
    canRemoveMember,
    canCreateTask,
    canUpdateTask,
    canDeleteTask,
    canAssignTask,
    canCreateLabel,
    canUpdateLabel,
    canDeleteLabel,
    canCancelInvitation,
    canArchiveProject,
    canRestoreProject,
    isProjectLead,
    isContributor,
    isViewer,
  }
}
