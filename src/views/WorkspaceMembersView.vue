<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex justify-between items-start">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Team Members ({{ members.length }})</h1>
        <p class="text-muted-foreground">Manage workspace members and their roles</p>
      </div>
      <Button v-if="canInviteMember" @click="showInviteDialog = true">
        <UserPlus class="mr-2 h-4 w-4" />
        Invite Member
      </Button>
    </div>

    <!-- Members List -->
    <div v-if="loadingMembers" class="space-y-3">
      <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
    </div>

    <MembersDataTable
      v-else-if="members.length > 0"
      :members="members"
      :can-edit="canUpdateMember"
      :can-remove="canDeleteMember"
      @edit="editMember"
      @remove="removeMember"
    />

    <Empty v-else>
      <EmptyContent>
        <EmptyMedia>
          <Users class="h-12 w-12" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No Members</EmptyTitle>
          <EmptyDescription>Invite people to join your workspace.</EmptyDescription>
        </EmptyHeader>
      </EmptyContent>
    </Empty>

    <!-- Invite Member Dialog -->
    <Sheet v-model:open="showInviteDialog">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Invite Team Member</SheetTitle>
          <SheetDescription>Send an invitation to join your workspace.</SheetDescription>
        </SheetHeader>
        <div class="mt-6 px-6">
          <InviteMemberForm
            v-if="workspace"
            :workspace-id="workspace.id"
            @success="handleInviteSuccess"
            @cancel="showInviteDialog = false"
          />
          <div v-else class="text-center text-muted-foreground py-8">
            <p>Loading workspace...</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Update Member Role Dialog -->
    <Sheet v-model:open="showUpdateRoleDialog">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update Member Role</SheetTitle>
          <SheetDescription>
            Change the role for {{ selectedMember?.user.email }}
          </SheetDescription>
        </SheetHeader>
        <div class="mt-6 px-6">
          <UpdateMemberRoleForm
            v-if="selectedMember && workspace"
            :workspace-id="workspace.id"
            :member="selectedMember"
            @success="handleRoleUpdateSuccess"
            @cancel="showUpdateRoleDialog = false"
          />
          <div v-else class="text-center text-muted-foreground py-8">
            <p>Loading workspace...</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/stores/workspace'
import { workspaceApi } from '@/api/workspace'
import { InviteMemberForm, UpdateMemberRoleForm, MembersDataTable } from '@/components/workspace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { UserPlus, Users } from 'lucide-vue-next'
import type { WorkspaceMemberResponse } from '@/types/workspace'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'

const workspaceStore = useWorkspaceStore()
const { canInviteMember, canUpdateMember, canDeleteMember } = useWorkspacePermissions()
const workspace = computed(() => workspaceStore.activeWorkspace)

const members = ref<WorkspaceMemberResponse[]>([])
const loadingMembers = ref(false)
const showInviteDialog = ref(false)
const showUpdateRoleDialog = ref(false)
const selectedMember = ref<WorkspaceMemberResponse | null>(null)

const loadMembers = async () => {
  if (!workspace.value) {
    toast.error('No workspace selected')
    return
  }

  loadingMembers.value = true
  try {
    const membersData = await workspaceApi.getMembers(workspace.value.id)
    members.value = membersData
  } catch (error) {
    console.error('Failed to load members:', error)
    toast.error('Failed to load members')
  } finally {
    loadingMembers.value = false
  }
}

const handleInviteSuccess = () => {
  showInviteDialog.value = false
  toast.success('Invitation sent successfully!')
  // No need to reload, user can view invitations on the invitations page
}

const editMember = (member: WorkspaceMemberResponse) => {
  selectedMember.value = member
  showUpdateRoleDialog.value = true
}

const handleRoleUpdateSuccess = (updatedMember: WorkspaceMemberResponse) => {
  showUpdateRoleDialog.value = false
  const index = members.value.findIndex((m) => m.id === updatedMember.id)
  if (index !== -1) {
    members.value[index] = updatedMember
  }
  toast.success('Member role updated successfully!')
}

const removeMember = async (member: WorkspaceMemberResponse) => {
  if (!workspace.value || !confirm(`Remove ${member.user.email} from the workspace?`)) return

  try {
    await workspaceApi.deleteMember(workspace.value.id, member.user.id)
    members.value = members.value.filter((m) => m.id !== member.id)
    toast.success('Member removed successfully!')
  } catch (error) {
    console.error('Failed to remove member:', error)
  }
}

onMounted(async () => {
  // Ensure workspace is loaded
  if (!workspace.value && !workspaceStore.isInitialized) {
    try {
      await workspaceStore.fetchWorkspaces()
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
      toast.error('Failed to load workspace')
      return
    }
  }

  // Load members if workspace is available
  if (workspace.value) {
    await loadMembers()
  }
})

// Watch for workspace changes and reload members
watch(
  () => workspaceStore.activeWorkspaceId,
  async (newWorkspaceId, oldWorkspaceId) => {
    if (newWorkspaceId && newWorkspaceId !== oldWorkspaceId) {
      await loadMembers()
    } else if (!newWorkspaceId) {
      members.value = []
    }
  },
)
</script>
