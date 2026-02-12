<script setup lang="ts">
import { ChevronsUpDown, Plus, Building2 } from 'lucide-vue-next'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import type { WorkspaceResponse } from '@/types/workspace'

const route = useRoute()
const { isMobile } = useSidebar()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

// Get workspace ID from route params if available
const workspaceIdFromRoute = computed(() => route.params.workspaceId as string | undefined)

onMounted(async () => {
  // Only fetch workspaces if authenticated and not already initialized
  if (!authStore.isAuthenticated || workspaceStore.isInitialized) {
    return
  }

  try {
    await workspaceStore.fetchWorkspaces()

    // Set active workspace from route if available and valid
    if (workspaceIdFromRoute.value) {
      workspaceStore.setActiveWorkspaceById(workspaceIdFromRoute.value)
    }
    // Otherwise, fetchWorkspaces will handle setting the active workspace
  } catch (err) {
    console.error('Failed to fetch workspaces:', err)
  }
})

// Watch for route changes to update active workspace
watch(workspaceIdFromRoute, (newWorkspaceId) => {
  if (newWorkspaceId) {
    workspaceStore.setActiveWorkspaceById(newWorkspaceId)
  }
})

// Get initials for workspace avatar
const getWorkspaceInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleWorkspaceSelect = (workspace: WorkspaceResponse) => {
  workspaceStore.setActiveWorkspace(workspace)
  // You can add navigation logic here if needed
  // router.push(`/workspace/${workspace.id}`)
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <Building2 v-if="!workspaceStore.activeWorkspace" class="size-4" />
              <span v-else class="text-xs font-semibold">
                {{ getWorkspaceInitials(workspaceStore.activeWorkspace.name) }}
              </span>
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">
                {{ workspaceStore.activeWorkspace?.name || 'No Workspace' }}
              </span>
              <span class="truncate text-xs text-muted-foreground">
                {{ workspaceStore.activeWorkspace?.slug || 'Select a workspace' }}
              </span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground"> Workspaces </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="(workspace, index) in workspaceStore.workspaces"
            :key="workspace.id"
            class="gap-2 p-2"
            @click="handleWorkspaceSelect(workspace)"
          >
            <div
              class="flex size-6 items-center justify-center rounded-sm border bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <span class="text-[10px] font-semibold">
                {{ getWorkspaceInitials(workspace.name) }}
              </span>
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="truncate text-sm">{{ workspace.name }}</span>
              <span class="truncate text-xs text-muted-foreground">{{ workspace.slug }}</span>
            </div>
            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2">
            <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">Add workspace</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
