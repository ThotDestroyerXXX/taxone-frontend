<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { FolderKanban, Building2, Calendar, User } from 'lucide-vue-next'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const { canCreateProject } = useWorkspacePermissions()

const hasWorkspace = computed(() => workspaceStore.hasActiveWorkspace)

// Check if we're in initial loading phase (authenticated but workspaces not loaded yet)
const isInitialLoading = computed(() => {
  return authStore.isAuthenticated && !workspaceStore.isInitialized && workspaceStore.isLoading
})

const loadProjects = async () => {
  // Don't attempt to load if not authenticated
  if (!authStore.isAuthenticated || !workspaceStore.activeWorkspaceId) {
    return
  }

  try {
    await projectStore.fetchProjects(workspaceStore.activeWorkspaceId)
  } catch (err) {
    console.error('Failed to load projects:', err)
  }
}

onMounted(async () => {
  // First ensure workspaces are loaded for this session
  if (authStore.isAuthenticated && !workspaceStore.isInitialized) {
    try {
      await workspaceStore.fetchWorkspaces()
    } catch (err) {
      console.error('Failed to load workspaces:', err)
      return
    }
  }

  // Then load projects if we have a valid workspace
  if (hasWorkspace.value) {
    await loadProjects()
  }
})

// Watch for workspace changes and reload projects
watch(
  () => workspaceStore.activeWorkspaceId,
  async (newWorkspaceId) => {
    if (newWorkspaceId) {
      await loadProjects()
    } else {
      // Clear projects when no workspace is selected
      projectStore.clearProjects()
    }
  },
)

const handleRefresh = async () => {
  await loadProjects()
}

const handleViewProject = (projectId: string) => {
  router.push({
    name: 'tasks',
    params: {
      workspaceId: workspaceStore.activeWorkspaceId,
      projectId,
    },
  })
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-400/20'
    case 'archived':
      return 'bg-muted text-muted-foreground ring-border'
    case 'draft':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-400/20'
    default:
      return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-400/20'
  }
}

const getPriorityClass = (priority: string) => {
  const classes = {
    LOW: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    CRITICAL: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  }
  return classes[priority as keyof typeof classes] || 'bg-secondary text-secondary-foreground'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Initial Loading State (fetching workspaces after login) -->
    <div v-if="isInitialLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 6" :key="i">
        <CardHeader>
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>

    <!-- No Workspace Selected -->
    <Empty v-else-if="!hasWorkspace && workspaceStore.isInitialized">
      <EmptyMedia variant="icon">
        <Building2 />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No workspace selected</EmptyTitle>
        <EmptyDescription>
          Please select a workspace from the sidebar to view your projects
        </EmptyDescription>
      </EmptyHeader>
    </Empty>

    <!-- Has Workspace -->
    <div v-else-if="hasWorkspace">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Projects</h1>
          <p class="text-muted-foreground mt-2">
            Manage projects in {{ workspaceStore.activeWorkspace?.name }}
          </p>
        </div>
        <Button @click="handleRefresh" :disabled="projectStore.isLoading">
          <svg
            v-if="!projectStore.isLoading"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-2"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <span v-if="projectStore.isLoading">Refreshing...</span>
          <span v-else>Refresh</span>
        </Button>
      </div>

      <!-- Loading State -->
      <div
        v-if="projectStore.isLoading && projectStore.projects.length === 0"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <Card v-for="i in 6" :key="i">
          <CardHeader>
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton class="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>

      <!-- Error State -->
      <Card v-else-if="projectStore.error" class="border-destructive">
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p class="font-semibold text-destructive">Error loading projects</p>
              <p class="text-sm text-muted-foreground">{{ projectStore.error }}</p>
            </div>
          </div>
          <Button @click="handleRefresh" class="mt-4" variant="outline"> Try Again </Button>
        </CardContent>
      </Card>

      <!-- Empty State -->
      <Empty v-else-if="!projectStore.isLoading && projectStore.projects.length === 0">
        <EmptyMedia variant="icon">
          <FolderKanban />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No projects found</EmptyTitle>
          <EmptyDescription>Get started by creating your first project</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button v-if="canCreateProject">Create Project</Button>
        </EmptyContent>
      </Empty>

      <!-- Projects Grid -->
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="project in projectStore.projects"
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
              <Badge variant="outline" :class="getStatusColor(project.status)">
                {{ project.status }}
              </Badge>
              <Badge :class="getPriorityClass(project.priority)">
                {{ project.priority }}
              </Badge>
              <Badge variant="secondary" class="text-xs">
                {{ project.isPublic ? 'Public' : 'Private' }}
              </Badge>
            </div>
            <div class="mt-3 flex flex-row gap-4 justify-between items-center">
              <div class="space-y-2 text-xs text-muted-foreground">
                <div class="flex items-center gap-2">
                  <Calendar class="h-3 w-3" />
                  <span
                    >{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <User class="h-3 w-3" />
                  <span>{{ project.owner.email }}</span>
                </div>
              </div>
              <Button size="sm" @click.stop="handleViewProject(project.id)">View</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
