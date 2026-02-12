<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import { Home, FolderKanban, Users, Tag, Settings } from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

// Navigation data
const data = {
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
      isActive: false,
    },
    {
      title: 'Projects',
      url: '/workspace/projects',
      icon: FolderKanban,
      isActive: false,
    },
    {
      title: 'Members',
      url: '/workspace/members',
      icon: Users,
      isActive: false,
    },
    {
      title: 'Labels',
      url: '/workspace/labels',
      icon: Tag,
      isActive: false,
    },
    {
      title: 'Settings',
      url: '/workspace/settings',
      icon: Settings,
      isActive: false,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
