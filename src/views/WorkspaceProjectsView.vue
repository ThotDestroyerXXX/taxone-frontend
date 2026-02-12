<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex justify-between items-start">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Projects</h1>
        <p class="text-muted-foreground">Manage workspace projects</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        Create Project
      </Button>
    </div>

    <!-- Projects Grid -->
    <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 6" :key="i">
        <CardHeader>
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-20 w-full" />
        </CardContent>
      </Card>
    </div>

    <div v-else-if="projects.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="project in projects"
        :key="project.id"
        class="hover:shadow-lg transition-shadow cursor-pointer pt-0 overflow-hidden"
      >
        <div
          v-if="project.color"
          class="w-full h-2 shrink-0"
          :style="{ backgroundColor: project.color }"
        ></div>
        <CardHeader>
          <div class="flex items-center justify-between gap-4">
            <CardTitle class="line-clamp-1 break-all">{{ project.name }}</CardTitle>
            <span
              class="text-xs px-2 py-1 bg-secondary rounded font-mono"
              :style="{ borderLeft: `3px solid ${project.color}` }"
            >
              {{ project.projectKey }}
            </span>
          </div>
          <CardDescription v-if="project.description" class="line-clamp-2 mt-2">
            {{ project.description }}
          </CardDescription>
          <CardDescription v-else class="text-muted-foreground/50 mt-1">
            No description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex gap-2 flex-wrap items-center text-sm">
            <span
              class="inline-flex items-center w-fit rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset"
              :class="getStatusColor(project.status)"
            >
              {{ project.status }}
            </span>
            <span
              class="px-2 py-1 rounded text-xs font-medium"
              :class="getPriorityClass(project.priority)"
            >
              {{ project.priority }}
            </span>
            <span class="text-xs text-muted-foreground">
              {{ project.isPublic ? 'Public' : 'Private' }}
            </span>
          </div>
          <div class="mt-3 flex flex-row gap-4 justify-between items-center">
            <div class="space-y-2 text-xs text-muted-foreground">
              <div class="flex items-center gap-2">
                <Calendar class="h-3 w-3" />
                <span>{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <User class="h-3 w-3" />
                <span>{{ project.owner.email }}</span>
              </div>
            </div>
            <Button size="sm" @click.stop="navigateToProject(project.id)">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Empty v-else>
      <EmptyContent>
        <EmptyMedia>
          <FolderKanban class="h-16 w-16" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            Create your first project to start organizing your work.
          </EmptyDescription>
        </EmptyHeader>
        <Button @click="showCreateDialog = true" class="mt-4">
          <Plus class="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </EmptyContent>
    </Empty>

    <!-- Create Project Dialog -->
    <Sheet v-model:open="showCreateDialog">
      <SheetContent class="sm:max-w-150 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>Add a new project to your workspace.</SheetDescription>
        </SheetHeader>
        <div class="mt-6 px-6">
          <CreateProjectForm
            v-if="workspace"
            :workspace-id="workspace.id"
            @success="handleCreateSuccess"
            @cancel="showCreateDialog = false"
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
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/stores/workspace'
import { workspaceApi } from '@/api/workspace'
import { CreateProjectForm } from '@/components/workspace'
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
import { Plus, FolderKanban, Calendar, User } from 'lucide-vue-next'
import type { ProjectResponse } from '@/types/project'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const workspace = computed(() => workspaceStore.activeWorkspace)

const projects = ref<ProjectResponse[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)

const getPriorityClass = (priority: string) => {
  const classes = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  }
  return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-50 text-green-700 ring-green-600/20'
    case 'archived':
      return 'bg-gray-50 text-gray-700 ring-gray-600/20'
    case 'draft':
      return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
    default:
      return 'bg-blue-50 text-blue-700 ring-blue-600/20'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const loadProjects = async () => {
  if (!workspace.value) {
    toast.error('No workspace selected')
    return
  }

  loading.value = true
  try {
    projects.value = await workspaceApi.getProjects(workspace.value.id)
  } catch (error) {
    console.error('Failed to load projects:', error)
    toast.error('Failed to load projects')
  } finally {
    loading.value = false
  }
}

const handleCreateSuccess = (project: ProjectResponse) => {
  showCreateDialog.value = false
  projects.value.push(project)
  toast.success('Project created successfully!')
}

const navigateToProject = (projectId: string) => {
  if (workspace.value) {
    router.push(`/workspace/${workspace.value.id}/project/${projectId}/tasks`)
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

  // Load projects if workspace is available
  if (workspace.value) {
    await loadProjects()
  }
})
</script>
