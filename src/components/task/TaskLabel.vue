<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import type { LabelResponse } from '@/types/label'

interface Props {
  label: LabelResponse
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  clickable: false,
})

const emit = defineEmits<{
  click: [label: LabelResponse]
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-[10px] px-1.5 py-0.5'
    case 'lg':
      return 'text-sm px-3 py-1.5'
    default:
      return 'text-xs px-2 py-1'
  }
})

const cursorClass = computed(() => (props.clickable ? 'cursor-pointer hover:opacity-80' : ''))

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.label)
  }
}
</script>

<template>
  <Badge
    variant="outline"
    :class="[sizeClasses, cursorClass, 'transition-opacity font-medium']"
    :style="{
      backgroundColor: label.color + '20',
      color: label.color,
      borderColor: label.color + '60',
    }"
    :title="label.description"
    @click="handleClick"
  >
    <div class="flex items-center gap-1">
      <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: label.color }" />
      <span>{{ label.name }}</span>
    </div>
  </Badge>
</template>
