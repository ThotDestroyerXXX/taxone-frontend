<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex justify-between items-start">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Invitations</h1>
        <p class="text-muted-foreground">
          Manage pending workspace invitations ({{ invitations.length }})
        </p>
      </div>
      <Button v-if="canInviteMember" @click="showInviteDialog = true">
        <UserPlus class="mr-2 h-4 w-4" />
        Send Invitation
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <Card v-for="i in 3" :key="i">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-48" />
              <Skeleton class="h-3 w-64" />
            </div>
            <Skeleton class="h-9 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Invitations List -->
    <div v-else-if="invitations.length > 0" class="space-y-3">
      <Card v-for="invitation in invitations" :key="invitation.id">
        <CardContent class="p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 flex-1">
              <Avatar class="h-12 w-12">
                <AvatarFallback class="bg-primary/10 text-primary text-lg">
                  {{ getInitials(invitation.email) }}
                </AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-semibold text-lg">{{ invitation.email }}</p>
                  <Badge :variant="getInvitationStatusVariant(invitation.status)">
                    {{ invitation.status }}
                  </Badge>
                </div>
                <div class="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div class="flex items-center gap-1.5">
                    <Shield class="h-3.5 w-3.5" />
                    <span>Role: {{ invitation.memberType }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <User class="h-3.5 w-3.5" />
                    <span>Invited by {{ invitation.invitedBy.email }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button
                v-if="canCancelInvitation"
                size="sm"
                variant="outline"
                @click="resendInvite(invitation.id)"
              >
                <RefreshCw class="h-4 w-4 mr-2" />
                Resend
              </Button>
              <Button
                v-if="canCancelInvitation"
                size="sm"
                variant="destructive"
                @click="cancelInvite(invitation.id)"
              >
                <X class="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Empty v-else>
      <EmptyContent>
        <EmptyMedia>
          <Mail class="h-16 w-16" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No Pending Invitations</EmptyTitle>
          <EmptyDescription>
            All invitations have been accepted or there are no pending invitations at this time.
          </EmptyDescription>
        </EmptyHeader>
        <Button v-if="canInviteMember" @click="showInviteDialog = true" class="mt-4">
          <UserPlus class="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      </EmptyContent>
    </Empty>

    <!-- Invite Member Dialog -->
    <Dialog v-model:open="showInviteDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>Send an invitation to join your workspace.</DialogDescription>
        </DialogHeader>
        <div class="mt-4">
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
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/stores/workspace'
import { workspaceApi } from '@/api/workspace'
import { InviteMemberForm } from '@/components/workspace'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { UserPlus, Mail, Shield, User, X, RefreshCw } from 'lucide-vue-next'
import type { WorkspaceInvitationResponse } from '@/types/workspace'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'
import { getInitials } from '@/utils/formatters'
import { getInvitationStatusVariant } from '@/utils/statusColors'

const workspaceStore = useWorkspaceStore()
const { canInviteMember, canCancelInvitation } = useWorkspacePermissions()
const workspace = computed(() => workspaceStore.activeWorkspace)

const invitations = ref<WorkspaceInvitationResponse[]>([])
const loading = ref(false)
const showInviteDialog = ref(false)

const loadInvitations = async () => {
  if (!workspace.value) {
    toast.error('No workspace selected')
    return
  }

  loading.value = true
  try {
    const data = await workspaceApi.getPendingInvitations(workspace.value.id)
    invitations.value = data
  } catch (error) {
    console.error('Failed to load invitations:', error)
    toast.error('Failed to load invitations')
  } finally {
    loading.value = false
  }
}

const handleInviteSuccess = (invitation: WorkspaceInvitationResponse) => {
  showInviteDialog.value = false
  invitations.value.unshift(invitation)
  toast.success('Invitation sent successfully!')
}

const resendInvite = async (invitationId: string) => {
  if (!workspace.value) return

  // When API is available, uncomment:
  // await workspaceApi.resendInvitation(workspace.value.id, invitationId)
  console.log('Resend invitation:', invitationId)
  toast.info('Resend invitation functionality coming soon!')
}

const cancelInvite = async (invitationId: string) => {
  if (!workspace.value) return

  if (!confirm('Are you sure you want to cancel this invitation?')) return

  try {
    await workspaceApi.cancelInvitation(workspace.value.id, invitationId)
    invitations.value = invitations.value.filter((i) => i.id !== invitationId)
    toast.success('Invitation cancelled successfully!')
  } catch (error) {
    console.error('Failed to cancel invitation:', error)
    toast.error('Failed to cancel invitation')
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

  // Load invitations if workspace is available
  if (workspace.value) {
    await loadInvitations()
  }
})

// Watch for workspace changes and reload invitations
watch(
  () => workspaceStore.activeWorkspaceId,
  async (newWorkspaceId, oldWorkspaceId) => {
    if (newWorkspaceId && newWorkspaceId !== oldWorkspaceId) {
      await loadInvitations()
    } else if (!newWorkspaceId) {
      invitations.value = []
    }
  },
)
</script>
