<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/sidebar/index.vue'
import { Toaster } from './components/ui/sonner'

const route = useRoute()
const showSidebar = computed(() => route.meta.requiresSidebar === true)
</script>

<template>
  <Sidebar v-if="showSidebar">
    <router-view />
  </Sidebar>
  <router-view v-else />
  <Toaster
    :rich-colors="true"
    :close-button="true"
    position="top-center"
    close-button-position="top-right"
  />
</template>

<style scoped></style>
