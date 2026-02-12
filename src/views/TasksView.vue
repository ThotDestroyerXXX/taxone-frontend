<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ListTodo, ArrowLeft, User, Calendar } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const projectStore = useProjectStore()

const projectId = computed(() => route.params.projectId as string)
const workspaceId = computed(() => route.params.workspaceId as string)

// Get current project info
const currentProject = computed(() => {
  return projectStore.projects.find((p) => p.id === projectId.value) || null
})

const loadTasks = async () => {
  if (!projectId.value) return

  try {
    await taskStore.fetchTasks(projectId.value)
  } catch (err) {
    console.error('Failed to load tasks:', err)
  }
}

onMounted(async () => {
  // Load project info if not available
  if (!currentProject.value && workspaceId.value) {
    try {
      await projectStore.fetchProjects(workspaceId.value)
    } catch (err) {
      console.error('Failed to load project info:', err)
    }
  }

  // Load tasks
  await loadTasks()
})

const handleRefresh = async () => {
  await loadTasks()
}

const handleBack = () => {
  router.push('/')
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityBarColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return '#ef4444'
    case 'high':
      return '#f97316'
    case 'medium':
      return '#eab308'
    case 'low':
      return '#3b82f6'
    default:
      return '#6b7280'
  }
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'done':
    case 'completed':
      return 'bg-green-50 text-green-700 ring-green-600/20'
    case 'in progress':
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20'
    case 'todo':
    case 'open':
      return 'bg-gray-50 text-gray-700 ring-gray-600/20'
    default:
      return 'bg-purple-50 text-purple-700 ring-purple-600/20'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" @click="handleBack">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Tasks</h1>
          <p v-if="currentProject" class="text-muted-foreground mt-2">
            {{ currentProject.name }}
            <span v-if="currentProject.projectKey" class="text-muted-foreground/60">
              ({{ currentProject.projectKey }})
            </span>
          </p>
        </div>
        <Button @click="handleRefresh" :disabled="taskStore.isLoading">
          <svg
            v-if="!taskStore.isLoading"
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
          <span v-if="taskStore.isLoading">Refreshing...</span>
          <span v-else>Refresh</span>
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="taskStore.isLoading && taskStore.tasks.length === 0"
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <Card v-for="i in 6" :key="i">
        <CardHeader>
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-1/2 mb-2" />
          <Skeleton class="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-else-if="taskStore.error" class="border-destructive">
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
            <p class="font-semibold text-destructive">Error loading tasks</p>
            <p class="text-sm text-muted-foreground">{{ taskStore.error }}</p>
          </div>
        </div>
        <Button @click="handleRefresh" class="mt-4" variant="outline"> Try Again </Button>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <Empty v-else-if="!taskStore.isLoading && taskStore.tasks.length === 0">
      <EmptyMedia variant="icon">
        <ListTodo />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No tasks found</EmptyTitle>
        <EmptyDescription
          >Get started by creating your first task for this project</EmptyDescription
        >
      </EmptyHeader>
      <EmptyContent>
        <Button>Create Task</Button>
      </EmptyContent>
    </Empty>

    <!-- Tasks Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="task in taskStore.tasks"
        :key="task.id"
        class="hover:shadow-lg transition-shadow cursor-pointer pt-0 overflow-hidden"
      >
        <div
          class="w-full h-2 shrink-0"
          :style="{ backgroundColor: getPriorityBarColor(task.priority) }"
        ></div>
        <CardHeader>
          <div class="flex items-center justify-between gap-4">
            <CardTitle class="line-clamp-1 break-all text-base">{{ task.title }}</CardTitle>
            <span
              class="text-xs px-2 py-1 bg-secondary shrink-0 rounded font-mono"
              :style="{ borderLeft: `3px solid ${getPriorityBarColor(task.priority)}` }"
            >
              {{ task.taskKey }}
            </span>
          </div>
          <CardDescription v-if="task.description" class="line-clamp-2 mt-2">
            {{ task.description }}
          </CardDescription>
          <CardDescription v-else class="text-muted-foreground/50 mt-1">
            No description
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div class="flex gap-2 flex-wrap items-center text-sm mb-3">
            <span
              class="inline-flex items-center w-fit rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset"
              :class="getStatusColor(task.status)"
            >
              {{ task.status }}
            </span>
            <span
              class="px-2 py-1 rounded text-xs font-medium"
              :class="getPriorityColor(task.priority)"
            >
              {{ task.priority }}
            </span>
          </div>

          <div class="space-y-2 text-xs text-muted-foreground">
            <!-- Reporter -->
            <div class="flex items-center gap-2">
              <User class="h-3 w-3" />
              <span>{{ task.reporter.email }}</span>
            </div>

            <!-- Due Date -->
            <div v-if="task.dueDate" class="flex items-center gap-2">
              <Calendar class="h-3 w-3" />
              <span>Due {{ formatDate(task.dueDate) }}</span>
            </div>

            <!-- Assignees -->
            <div v-if="task.assignees?.length > 0" class="flex items-center gap-2">
              <User class="h-3 w-3" />
              <div class="flex -space-x-2">
                <div
                  v-for="assignee in task.assignees.slice(0, 3)"
                  :key="assignee.id"
                  class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs ring-2 ring-background"
                  :title="`${assignee.firstName} ${assignee.lastName}`"
                >
                  {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                </div>
                <div
                  v-if="task.assignees.length > 3"
                  class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs ring-2 ring-background"
                >
                  +{{ task.assignees.length - 3 }}
                </div>
              </div>
            </div>

            <!-- Labels -->
            <div v-if="task.labels?.length > 0" class="flex flex-wrap gap-1 pt-1">
              <span
                v-for="label in task.labels.slice(0, 3)"
                :key="label.id"
                class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                :style="{
                  backgroundColor: label.color + '20',
                  color: label.color,
                  borderColor: label.color,
                }"
              >
                {{ label.name }}
              </span>
              <span
                v-if="task.labels.length > 3"
                class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                +{{ task.labels.length - 3 }}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter class="mt-auto">
          <div class="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>Created {{ formatDate(task.createdAt) }}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
