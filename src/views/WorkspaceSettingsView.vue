<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold">Workspace Settings</h1>
      <p class="text-muted-foreground">Manage your workspace configuration and settings</p>
    </div>

    <Card v-if="workspace">
      <CardHeader>
        <CardTitle>Workspace Information</CardTitle>
        <CardDescription>View and edit your workspace details</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="!isEditing" class="space-y-4">
          <div class="grid gap-2">
            <div class="flex items-center gap-2">
              <Building2 class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium text-muted-foreground">Name</p>
                <p class="text-lg font-semibold">{{ workspace.name }}</p>
              </div>
            </div>
          </div>

          <div class="grid gap-2">
            <p class="text-sm font-medium text-muted-foreground">Slug</p>
            <code class="text-sm bg-muted px-2 py-1 rounded">{{ workspace.slug }}</code>
          </div>

          <div class="grid gap-2">
            <p class="text-sm font-medium text-muted-foreground">Description</p>
            <p>{{ workspace.description || 'No description' }}</p>
          </div>

          <div v-if="workspace.logoUrl" class="grid gap-2">
            <p class="text-sm font-medium text-muted-foreground">Logo</p>
            <img :src="workspace.logoUrl" alt="Logo" class="h-20 w-20 object-contain rounded" />
          </div>

          <div class="grid gap-2">
            <p class="text-sm font-medium text-muted-foreground">Owner</p>
            <p>{{ workspace.owner.email }}</p>
          </div>

          <div class="grid gap-2">
            <p class="text-sm font-medium text-muted-foreground">Status</p>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="
                workspace.isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-destructive/10 text-destructive dark:bg-destructive/20'
              "
            >
              {{ workspace.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex gap-2 pt-4">
            <Button v-if="canUpdateWorkspace" @click="isEditing = true">
              <Settings class="mr-2 h-4 w-4" />
              Edit Workspace
            </Button>
            <Button
              v-if="canRestoreWorkspace && !workspace.isActive"
              variant="outline"
              @click="handleRestore"
            >
              <RefreshCw class="mr-2 h-4 w-4" />
              Restore Workspace
            </Button>
            <Button
              v-if="canDeleteWorkspace && workspace.isActive"
              variant="destructive"
              @click="handleDelete"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Delete Workspace
            </Button>
          </div>
        </div>

        <UpdateWorkspaceForm
          v-else
          :workspace="workspace"
          @success="handleUpdateSuccess"
          @cancel="isEditing = false"
        />
      </CardContent>
    </Card>

    <Card v-else-if="loading">
      <CardHeader>
        <Skeleton class="h-8 w-64" />
        <Skeleton class="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <Skeleton class="h-32 w-full" />
      </CardContent>
    </Card>

    <Empty v-else>
      <EmptyContent>
        <EmptyMedia>
          <Building2 class="h-16 w-16" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No Workspace Found</EmptyTitle>
          <EmptyDescription>
            Unable to load workspace information. Please try again.
          </EmptyDescription>
        </EmptyHeader>
      </EmptyContent>
    </Empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/stores/workspace'
import { workspaceApi } from '@/api/workspace'
import { UpdateWorkspaceForm } from '@/components/workspace'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Building2, Settings, Trash2, RefreshCw } from 'lucide-vue-next'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const { canUpdateWorkspace, canDeleteWorkspace, canRestoreWorkspace } = useWorkspacePermissions()
const workspace = computed(() => workspaceStore.activeWorkspace)
const loading = computed(() => workspaceStore.isLoading)

const isEditing = ref(false)

const handleUpdateSuccess = async () => {
  isEditing.value = false
  // Refresh workspace from store
  await workspaceStore.fetchWorkspaces()
  toast.success('Workspace updated successfully!')
}

const handleDelete = async () => {
  if (!workspace.value) return
  if (!confirm('Are you sure you want to delete this workspace? This action cannot be undone.'))
    return

  try {
    await workspaceApi.delete(workspace.value.id)
    await workspaceStore.fetchWorkspaces()
    toast.success('Workspace deleted successfully!')
    router.push('/')
  } catch (error) {
    console.error('Failed to delete workspace:', error)
    toast.error('Failed to delete workspace')
  }
}

const handleRestore = async () => {
  if (!workspace.value) return

  try {
    await workspaceApi.restore(workspace.value.id)
    await workspaceStore.fetchWorkspaces()
    toast.success('Workspace restored successfully!')
  } catch (error) {
    console.error('Failed to restore workspace:', error)
    toast.error('Failed to restore workspace')
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
    }
  }
})

// Watch for workspace changes and reset editing mode
watch(
  () => workspaceStore.activeWorkspaceId,
  (newWorkspaceId, oldWorkspaceId) => {
    if (newWorkspaceId !== oldWorkspaceId) {
      isEditing.value = false
    }
  },
)
</script>
