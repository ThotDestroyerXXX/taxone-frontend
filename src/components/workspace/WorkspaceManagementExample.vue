<template>
  <div class="container mx-auto py-8 space-y-8">
    <div class="space-y-4">
      <h1 class="text-3xl font-bold">Workspace Management</h1>
      <p class="text-muted-foreground">
        Complete example of how to use all workspace functionality
      </p>
    </div>

    <!-- Create Workspace Section -->
    <Card>
      <CardHeader>
        <CardTitle>Create Workspace</CardTitle>
        <CardDescription>Create a new workspace for your team</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateWorkspaceForm
          v-if="showCreateForm"
          @success="handleWorkspaceCreated"
          @cancel="showCreateForm = false"
        />
        <Button v-else @click="showCreateForm = true"> Create New Workspace </Button>
      </CardContent>
    </Card>

    <!-- Manage Current Workspace -->
    <Card v-if="currentWorkspace">
      <CardHeader>
        <CardTitle>{{ currentWorkspace.name }}</CardTitle>
        <CardDescription>{{ currentWorkspace.description }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-2">
          <Button @click="showUpdateForm = !showUpdateForm"> Edit Workspace </Button>
          <Button variant="destructive" @click="handleDeleteWorkspace"> Delete Workspace </Button>
        </div>

        <UpdateWorkspaceForm
          v-if="showUpdateForm"
          :workspace="currentWorkspace"
          @success="handleWorkspaceUpdated"
          @cancel="showUpdateForm = false"
        />
      </CardContent>
    </Card>

    <!-- Members Management -->
    <Card v-if="currentWorkspace">
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Manage workspace members and invitations</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Button @click="showInviteForm = !showInviteForm"> Invite Member </Button>

        <InviteMemberForm
          v-if="showInviteForm"
          :workspace-id="currentWorkspace.id"
          @success="handleMemberInvited"
          @cancel="showInviteForm = false"
        />

        <div v-if="members.length > 0" class="space-y-2">
          <h3 class="font-semibold">Current Members</h3>
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div>
              <p class="font-medium">{{ member.user.email }}</p>
              <p class="text-sm text-muted-foreground">{{ member.memberType }}</p>
            </div>
            <div class="flex gap-2">
              <Button size="sm" @click="editMember(member)"> Edit Role </Button>
              <Button size="sm" variant="destructive" @click="removeMember(member.user.id)">
                Remove
              </Button>
            </div>
          </div>
        </div>

        <!-- Update Member Role Dialog -->
        <Sheet v-model:open="showUpdateRoleSheet">
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Update Member Role</SheetTitle>
              <SheetDescription>
                Change the role for {{ selectedMember?.user.email }}
              </SheetDescription>
            </SheetHeader>
            <div class="mt-4">
              <UpdateMemberRoleForm
                v-if="selectedMember && currentWorkspace"
                :workspace-id="currentWorkspace.id"
                :member="selectedMember"
                @success="handleRoleUpdated"
                @cancel="showUpdateRoleSheet = false"
              />
            </div>
          </SheetContent>
        </Sheet>

        <div v-if="invitations.length > 0" class="space-y-2">
          <h3 class="font-semibold">Pending Invitations</h3>
          <div
            v-for="invitation in invitations"
            :key="invitation.id"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div>
              <p class="font-medium">{{ invitation.email }}</p>
              <p class="text-sm text-muted-foreground">{{ invitation.memberType }}</p>
            </div>
            <Button size="sm" variant="destructive" @click="cancelInvite(invitation.id)">
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Projects Management -->
    <Card v-if="currentWorkspace">
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Create and manage workspace projects</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Button @click="showProjectForm = !showProjectForm"> Create Project </Button>

        <CreateProjectForm
          v-if="showProjectForm"
          :workspace-id="currentWorkspace.id"
          @success="handleProjectCreated"
          @cancel="showProjectForm = false"
        />

        <div v-if="projects.length > 0" class="grid gap-4">
          <div v-for="project in projects" :key="project.id" class="p-4 border rounded-lg">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: project.color }" />
                  <h3 class="font-semibold">{{ project.name }}</h3>
                  <span class="text-xs px-2 py-1 bg-secondary rounded">
                    {{ project.projectKey }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mt-1">{{ project.description }}</p>
                <div class="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Priority: {{ project.priority }}</span>
                  <span>{{ project.startDate }} - {{ project.endDate }}</span>
                  <span>{{ project.isPublic ? 'Public' : 'Private' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Labels Management -->
    <Card v-if="currentWorkspace">
      <CardHeader>
        <CardTitle>Labels</CardTitle>
        <CardDescription>Create and manage workspace labels</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Button @click="showLabelForm = !showLabelForm"> Create Label </Button>

        <CreateLabelForm
          v-if="showLabelForm"
          :workspace-id="currentWorkspace.id"
          @success="handleLabelCreated"
          @cancel="showLabelForm = false"
        />

        <div v-if="labels.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="label in labels"
            :key="label.id"
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
            :style="{ backgroundColor: label.color + '20', borderColor: label.color }"
          >
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: label.color }" />
            <span class="text-sm font-medium">{{ label.name }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useWorkspaceManagement } from '@/composables/useWorkspaceManagement'
import { useActiveWorkspace } from '@/composables/useActiveWorkspace'
import type {
  WorkspaceResponse,
  WorkspaceMemberResponse,
  WorkspaceInvitationResponse,
} from '@/types/workspace'
import type { ProjectResponse } from '@/types/project'
import type { LabelResponse } from '@/types/label'
import {
  CreateWorkspaceForm,
  UpdateWorkspaceForm,
  InviteMemberForm,
  UpdateMemberRoleForm,
  CreateProjectForm,
  CreateLabelForm,
} from '@/components/workspace'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// Get the active workspace
const { activeWorkspace: currentWorkspace } = useActiveWorkspace()

// Initialize the composable with the current workspace ID
const workspaceManagement = useWorkspaceManagement(currentWorkspace.value?.id)

// State
const showCreateForm = ref(false)
const showUpdateForm = ref(false)
const showInviteForm = ref(false)
const showUpdateRoleSheet = ref(false)
const showProjectForm = ref(false)
const showLabelForm = ref(false)

const members = ref<WorkspaceMemberResponse[]>([])
const invitations = ref<WorkspaceInvitationResponse[]>([])
const projects = ref<ProjectResponse[]>([])
const labels = ref<LabelResponse[]>([])
const selectedMember = ref<WorkspaceMemberResponse | null>(null)

// Workspace handlers
const handleWorkspaceCreated = (workspace: WorkspaceResponse) => {
  showCreateForm.value = false
  toast.success('Workspace created successfully!')
  // Optionally navigate to the new workspace
}

const handleWorkspaceUpdated = (workspace: WorkspaceResponse) => {
  showUpdateForm.value = false
  if (currentWorkspace.value) {
    Object.assign(currentWorkspace.value, workspace)
  }
  toast.success('Workspace updated successfully!')
}

const handleDeleteWorkspace = async () => {
  if (!currentWorkspace.value) return
  if (!confirm('Are you sure you want to delete this workspace?')) return

  try {
    await workspaceManagement.deleteWorkspace(currentWorkspace.value.id)
    toast.success('Workspace deleted successfully!')
    // Navigate away from this workspace
  } catch (error) {
    console.error('Failed to delete workspace:', error)
  }
}

// Member handlers
const handleMemberInvited = (invitation: WorkspaceInvitationResponse) => {
  showInviteForm.value = false
  invitations.value.push(invitation)
  toast.success('Member invited successfully!')
}

const editMember = (member: WorkspaceMemberResponse) => {
  selectedMember.value = member
  showUpdateRoleSheet.value = true
}

const handleRoleUpdated = (member: WorkspaceMemberResponse) => {
  showUpdateRoleSheet.value = false
  const index = members.value.findIndex((m) => m.id === member.id)
  if (index !== -1) {
    members.value[index] = member
  }
  toast.success('Member role updated successfully!')
}

const removeMember = async (userId: string) => {
  if (!confirm('Are you sure you want to remove this member?')) return

  try {
    await workspaceManagement.deleteMember(userId)
    members.value = members.value.filter((m) => m.user.id !== userId)
    toast.success('Member removed successfully!')
  } catch (error) {
    console.error('Failed to remove member:', error)
  }
}

const cancelInvite = async (invitationId: string) => {
  try {
    await workspaceManagement.cancelInvitation(invitationId)
    invitations.value = invitations.value.filter((i) => i.id !== invitationId)
    toast.success('Invitation cancelled successfully!')
  } catch (error) {
    console.error('Failed to cancel invitation:', error)
  }
}

// Project handlers
const handleProjectCreated = (project: ProjectResponse) => {
  showProjectForm.value = false
  projects.value.push(project)
  toast.success('Project created successfully!')
}

// Label handlers
const handleLabelCreated = (label: LabelResponse) => {
  showLabelForm.value = false
  labels.value.push(label)
  toast.success('Label created successfully!')
}

// Load data
const loadData = async () => {
  if (!currentWorkspace.value) return

  try {
    const [membersData, invitationsData, projectsData, labelsData] = await Promise.all([
      workspaceManagement.getMembers(),
      workspaceManagement.getPendingInvitations(),
      workspaceManagement.getProjects(),
      workspaceManagement.getLabels(),
    ])

    members.value = membersData
    invitations.value = invitationsData
    projects.value = projectsData
    labels.value = labelsData
  } catch (error) {
    console.error('Failed to load workspace data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
