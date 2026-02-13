<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-vue-next'
import type { LabelResponse } from '@/types/label'

interface Props {
  labels: LabelResponse[]
  modelValue: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const isOpen = ref(false)

const selectedLabels = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const toggleLabel = (labelId: string) => {
  const index = selectedLabels.value.indexOf(labelId)
  if (index > -1) {
    selectedLabels.value = selectedLabels.value.filter((id) => id !== labelId)
  } else {
    selectedLabels.value = [...selectedLabels.value, labelId]
  }
}

const clearFilters = () => {
  selectedLabels.value = []
}

const selectedLabelObjects = computed(() => {
  return props.labels.filter((label) => selectedLabels.value.includes(label.id))
})
</script>

<template>
  <div class="flex items-center gap-2">
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button variant="outline" size="sm" class="gap-2">
          <Filter class="h-4 w-4" />
          <span>Labels</span>
          <Badge v-if="selectedLabels.length > 0" variant="secondary" class="ml-1 px-1.5 py-0">
            {{ selectedLabels.length }}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-80 p-0" align="start">
        <div class="flex items-center justify-between border-b px-4 py-3">
          <h4 class="font-semibold text-sm">Filter by Labels</h4>
          <Button
            v-if="selectedLabels.length > 0"
            variant="ghost"
            size="sm"
            class="h-7 text-xs"
            @click="clearFilters"
          >
            Clear
          </Button>
        </div>

        <ScrollArea class="h-80">
          <div v-if="labels.length === 0" class="p-8 text-center text-sm text-muted-foreground">
            <p>No labels available</p>
            <p class="text-xs mt-2">Create labels in workspace settings</p>
          </div>

          <div v-else class="p-2">
            <button
              v-for="label in labels"
              :key="label.id"
              type="button"
              class="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
              @click="toggleLabel(label.id)"
            >
              <Checkbox :checked="selectedLabels.includes(label.id)" class="shrink-0" />
              <div
                class="w-8 h-8 rounded flex items-center justify-center shrink-0"
                :style="{ backgroundColor: label.color + '20' }"
              >
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: label.color }" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ label.name }}</p>
                <p
                  v-if="label.description"
                  class="text-xs text-muted-foreground truncate"
                  :title="label.description"
                >
                  {{ label.description }}
                </p>
              </div>
            </button>
          </div>
        </ScrollArea>

        <div v-if="selectedLabels.length > 0" class="border-t p-3 bg-muted/50">
          <p class="text-xs text-muted-foreground mb-2">Selected ({{ selectedLabels.length }}):</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="label in selectedLabelObjects"
              :key="label.id"
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-70"
              :style="{
                backgroundColor: label.color + '20',
                color: label.color,
                border: `1px solid ${label.color}60`,
              }"
              @click="toggleLabel(label.id)"
            >
              <span>{{ label.name }}</span>
              <X class="h-3 w-3" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <!-- Selected labels display (outside popover) -->
    <div v-if="selectedLabels.length > 0 && !isOpen" class="flex items-center gap-1 flex-wrap">
      <button
        v-for="label in selectedLabelObjects.slice(0, 3)"
        :key="label.id"
        type="button"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-70"
        :style="{
          backgroundColor: label.color + '20',
          color: label.color,
          border: `1px solid ${label.color}60`,
        }"
        @click="toggleLabel(label.id)"
      >
        <span>{{ label.name }}</span>
        <X class="h-3 w-3" />
      </button>
      <span v-if="selectedLabels.length > 3" class="text-xs text-muted-foreground">
        +{{ selectedLabels.length - 3 }} more
      </span>
    </div>
  </div>
</template>
