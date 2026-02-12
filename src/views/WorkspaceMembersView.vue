<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex justify-between items-start">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Team Members</h1>
        <p class="text-muted-foreground">Manage workspace members and invitations</p>
      </div>
      <Button @click="showInviteDialog = true">
        <UserPlus class="mr-2 h-4 w-4" />
        Invite Member
      </Button>
    </div>

    <!-- Members List -->
    <Card>
      <CardHeader>
        <CardTitle>Members ({{ members.length }})</CardTitle>
        <CardDescription>People who have access to this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loadingMembers" class="space-y-3">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>

        <MembersDataTable
          v-else-if="members.length > 0"
          :members="members"
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
      </CardContent>
    </Card>

    <!-- Pending Invitations -->
    <Card v-if="invitations.length > 0">
      <CardHeader>
        <CardTitle>Pending Invitations ({{ invitations.length }})</CardTitle>
        <CardDescription>Invitations waiting to be accepted</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="invitation in invitations"
            :key="invitation.id"
            class="flex items-center justify-between p-4 border rounded-lg"
          >
            <div class="flex items-center gap-4">
              <MailIcon class="h-8 w-8 text-muted-foreground" />
              <div>
                <p class="font-medium">{{ invitation.email }}</p>
                <p class="text-sm text-muted-foreground">
                  Role: {{ invitation.memberType }} • Invited by {{ invitation.invitedBy.email }}
                </p>
              </div>
            </div>
            <Button size="sm" variant="destructive" @click="cancelInvite(invitation.id)">
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

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
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/stores/workspace'
import { workspaceApi } from '@/api/workspace'
import { InviteMemberForm, UpdateMemberRoleForm, MembersDataTable } from '@/components/workspace'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { UserPlus, Users, MailIcon } from 'lucide-vue-next'
import type { WorkspaceMemberResponse, WorkspaceInvitationResponse } from '@/types/workspace'

const workspaceStore = useWorkspaceStore()
const workspace = computed(() => workspaceStore.activeWorkspace)

const members = ref<WorkspaceMemberResponse[]>([])
const invitations = ref<WorkspaceInvitationResponse[]>([])
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
    const [membersData, invitationsData] = await Promise.all([
      workspaceApi.getMembers(workspace.value.id),
      workspaceApi.getPendingInvitations(workspace.value.id),
    ])
    members.value = membersData
    invitations.value = invitationsData
  } catch (error) {
    console.error('Failed to load members:', error)
    toast.error('Failed to load members')
  } finally {
    loadingMembers.value = false
  }
}

const handleInviteSuccess = (invitation: WorkspaceInvitationResponse) => {
  showInviteDialog.value = false
  invitations.value.push(invitation)
  toast.success('Invitation sent successfully!')
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

const cancelInvite = async (invitationId: string) => {
  if (!workspace.value) return

  try {
    await workspaceApi.cancelInvitation(workspace.value.id, invitationId)
    invitations.value = invitations.value.filter((i) => i.id !== invitationId)
    toast.success('Invitation cancelled successfully!')
  } catch (error) {
    console.error('Failed to cancel invitation:', error)
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
</script>
