<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FolderKanban, Forward, MoreHorizontal, Trash2 } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const router = useRouter()
const { isMobile } = useSidebar()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

const projects = computed(() => projectStore.projects)
const activeWorkspace = computed(() => workspaceStore.activeWorkspace)

const navigateToProject = (projectId: string) => {
  if (activeWorkspace.value) {
    router.push(`/workspace/${activeWorkspace.value.id}/project/${projectId}/tasks`)
  }
}

const loadProjects = async () => {
  if (activeWorkspace.value?.id) {
    try {
      await projectStore.fetchProjects(activeWorkspace.value.id)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }
}

onMounted(async () => {
  // Ensure workspaces are loaded first if authenticated and not initialized
  if (authStore.isAuthenticated && !workspaceStore.isInitialized) {
    try {
      await workspaceStore.fetchWorkspaces()
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
    }
  }

  // Then load projects if workspace is available
  if (activeWorkspace.value?.id) {
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
      projectStore.clearProjects()
    }
  },
)
</script>

<template>
  <SidebarGroup class="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Projects</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="project in projects.slice(0, 5)" :key="project.id">
        <SidebarMenuButton as-child>
          <a href="#" @click.prevent="navigateToProject(project.id)">
            <FolderKanban />
            <span>{{ project.name }}</span>
          </a>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <MoreHorizontal />
              <span class="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-48 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :align="isMobile ? 'end' : 'start'"
          >
            <DropdownMenuItem @click="navigateToProject(project.id)">
              <FolderKanban class="text-muted-foreground" />
              <span>View Project</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward class="text-muted-foreground" />
              <span>Share Project</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 class="text-muted-foreground" />
              <span>Delete Project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton as-child class="text-sidebar-foreground/70">
          <router-link to="/workspace/projects">
            <MoreHorizontal class="text-sidebar-foreground/70" />
            <span>View All Projects</span>
          </router-link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
