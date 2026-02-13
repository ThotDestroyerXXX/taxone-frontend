<template>
  <div class="space-y-4">
    <!-- Month Navigation -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="previousMonth">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" @click="nextMonth">
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" @click="goToToday"> Today </Button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="border rounded-lg overflow-hidden">
      <!-- Day Headers -->
      <div class="grid grid-cols-7 bg-muted">
        <div
          v-for="day in dayNames"
          :key="day"
          class="p-2 text-center text-sm font-medium text-muted-foreground"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 bg-card">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="min-h-[120px] border-t border-l p-2 transition-colors"
          :class="{
            'bg-muted/30': !day.isCurrentMonth,
            'bg-primary/5 ring-2 ring-primary ring-inset': day.isToday,
            'hover:bg-accent/50 cursor-pointer': day.tasks.length > 0,
          }"
        >
          <!-- Day Number -->
          <div
            class="flex items-center justify-between mb-2"
            :class="{
              'text-muted-foreground': !day.isCurrentMonth,
              'font-semibold': day.isToday,
            }"
          >
            <span class="text-sm">{{ day.date.getDate() }}</span>
            <span v-if="day.tasks.length > 0" class="text-xs text-muted-foreground">
              {{ day.tasks.length }}
            </span>
          </div>

          <!-- Tasks for the day -->
          <div class="space-y-1">
            <div
              v-for="task in day.tasks.slice(0, 3)"
              :key="task.id"
              class="group rounded px-2 py-1 text-xs truncate cursor-pointer hover:shadow-md transition-all"
              :style="{
                backgroundColor: getPriorityBarColor(task.priority) + '20',
                borderLeft: `3px solid ${getPriorityBarColor(task.priority)}`,
              }"
              :title="`${task.taskKey}: ${task.title}\nPriority: ${task.priority}\nStatus: ${task.status}`"
              @click="$emit('task-click', task)"
            >
              <span class="font-medium">{{ task.taskKey }}</span>
              <span class="ml-1">{{ task.title }}</span>
            </div>
            <div
              v-if="day.tasks.length > 3"
              class="text-xs text-muted-foreground px-2 py-1 cursor-pointer hover:underline"
              @click="showMoreTasks(day)"
            >
              +{{ day.tasks.length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-6 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded" :style="{ backgroundColor: getPriorityBarColor('LOW') }"></div>
        <span class="text-muted-foreground">Low</span>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="w-3 h-3 rounded"
          :style="{ backgroundColor: getPriorityBarColor('MEDIUM') }"
        ></div>
        <span class="text-muted-foreground">Medium</span>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="w-3 h-3 rounded"
          :style="{ backgroundColor: getPriorityBarColor('HIGH') }"
        ></div>
        <span class="text-muted-foreground">High</span>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="w-3 h-3 rounded"
          :style="{ backgroundColor: getPriorityBarColor('CRITICAL') }"
        ></div>
        <span class="text-muted-foreground">Critical</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getPriorityBarColor } from '@/utils/statusColors'
import type { TaskResponse } from '@/types/task'

interface Props {
  tasks: TaskResponse[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'task-click': [task: TaskResponse]
  'show-more': [date: Date, tasks: TaskResponse[]]
}>()

const currentDate = ref(new Date())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  tasks: TaskResponse[]
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const lastDate = lastDay.getDate()

  // Days from previous month
  const prevMonthDays = firstDayOfWeek
  const prevMonthLastDate = new Date(year, month, 0).getDate()

  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month days
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDate - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      tasks: getTasksForDate(date),
    })
  }

  // Current month days
  for (let i = 1; i <= lastDate; i++) {
    const date = new Date(year, month, i)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      tasks: getTasksForDate(date),
    })
  }

  // Next month days to complete the grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      tasks: getTasksForDate(date),
    })
  }

  return days
})

const getTasksForDate = (date: Date): TaskResponse[] => {
  return props.tasks.filter((task) => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === date.getTime()
  })
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const showMoreTasks = (day: CalendarDay) => {
  emit('show-more', day.date, day.tasks)
}
</script>
