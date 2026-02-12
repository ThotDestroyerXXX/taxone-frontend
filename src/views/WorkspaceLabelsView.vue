<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex justify-between items-start">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Labels</h1>
        <p class="text-muted-foreground">Manage workspace labels for better organization</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        Create Label
      </Button>
    </div>

    <!-- Labels List -->
    <Card>
      <CardHeader>
        <CardTitle>All Labels ({{ labels.length }})</CardTitle>
        <CardDescription>Labels help you categorize and filter your tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 5" :key="i" class="h-20 w-full" />
        </div>

        <div v-else-if="labels.length > 0" class="space-y-3">
          <div
            v-for="label in labels"
            :key="label.id"
            class="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start gap-4 flex-1">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center mt-1"
                :style="{ backgroundColor: label.color + '20' }"
              >
                <Tag class="h-6 w-6" :style="{ color: label.color }" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-lg">{{ label.name }}</h3>
                  <div
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :style="{
                      backgroundColor: label.color + '20',
                      color: label.color,
                      border: `1px solid ${label.color}40`,
                    }"
                  >
                    {{ label.color }}
                  </div>
                </div>
                <p class="text-sm text-muted-foreground">{{ label.description }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <Button size="sm" variant="outline">
                <Settings class="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Empty v-else>
          <EmptyContent>
            <EmptyMedia>
              <Tag class="h-16 w-16" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Labels Yet</EmptyTitle>
              <EmptyDescription>
                Create labels to categorize and organize your tasks.
              </EmptyDescription>
            </EmptyHeader>
            <Button @click="showCreateDialog = true" class="mt-4">
              <Plus class="mr-2 h-4 w-4" />
              Create Label
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>

    <!-- Label Preview -->
    <Card v-if="labels.length > 0">
      <CardHeader>
        <CardTitle>Label Preview</CardTitle>
        <CardDescription>See how your labels look when applied to items</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="label in labels"
            :key="label.id"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-transform hover:scale-105"
            :style="{
              backgroundColor: label.color + '20',
              color: label.color,
              border: `1px solid ${label.color}40`,
            }"
          >
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: label.color }" />
            {{ label.name }}
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create Label Dialog -->
    <Sheet v-model:open="showCreateDialog">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Label</SheetTitle>
          <SheetDescription>Add a new label to your workspace.</SheetDescription>
        </SheetHeader>
        <div class="mt-6 px-6">
          <CreateLabelForm
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
import { toast } from 'vue-sonner'
import { useWorkspaceStore } from '@/stores/workspace'
import { workspaceApi } from '@/api/workspace'
import { CreateLabelForm } from '@/components/workspace'
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
import { Plus, Tag, Settings, Trash2 } from 'lucide-vue-next'
import type { LabelResponse } from '@/types/label'

const workspaceStore = useWorkspaceStore()
const workspace = computed(() => workspaceStore.activeWorkspace)

const labels = ref<LabelResponse[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)

const loadLabels = async () => {
  if (!workspace.value) {
    toast.error('No workspace selected')
    return
  }

  loading.value = true
  try {
    labels.value = await workspaceApi.getLabels(workspace.value.id)
  } catch (error) {
    console.error('Failed to load labels:', error)
    toast.error('Failed to load labels')
  } finally {
    loading.value = false
  }
}

const handleCreateSuccess = (label: LabelResponse) => {
  showCreateDialog.value = false
  labels.value.push(label)
  toast.success('Label created successfully!')
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

  // Load labels if workspace is available
  if (workspace.value) {
    await loadLabels()
  }
})
</script>
