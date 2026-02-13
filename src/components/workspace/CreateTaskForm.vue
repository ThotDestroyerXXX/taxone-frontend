<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel>Task Title</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Fix login bug" v-bind="componentField" />
        </FormControl>
        <FormDescription> A clear and concise task title (3-200 characters). </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Detailed description of the task..."
            class="min-h-[100px]"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription> Provide more context about this task (optional). </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-2 gap-4">
      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>Status</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="priority">
        <FormItem>
          <FormLabel>Priority</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <FormField v-slot="{ componentField, value }" name="dueDate">
        <FormItem class="flex flex-col">
          <FormLabel>Due Date</FormLabel>
          <Popover>
            <PopoverTrigger as-child>
              <FormControl>
                <Button
                  variant="outline"
                  :class="['w-full pl-3 text-left font-normal', !value && 'text-muted-foreground']"
                >
                  <span>{{ value ? formatDate(value) : 'Pick a date' }}</span>
                  <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
              <Calendar
                v-model="componentField.modelValue"
                initial-focus
                @update:model-value="
                  (date) => {
                    if (date) {
                      const jsDate = new Date(date.year, date.month - 1, date.day)
                      componentField.modelValue = formatDateToISO(jsDate)
                    } else {
                      componentField.modelValue = undefined
                    }
                  }
                "
              />
            </PopoverContent>
          </Popover>
          <FormDescription> When should this task be completed? </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="estimatedHours">
        <FormItem>
          <FormLabel>Estimated Hours</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="8"
              v-bind="componentField"
              @input="componentField.modelValue = Number(($event.target as HTMLInputElement).value)"
            />
          </FormControl>
          <FormDescription> How many hours will this take? </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('cancel')"> Cancel </Button>
      <Button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Creating...</span>
        <span v-else>Create Task</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { taskFormSchema, type TaskFormData } from '@/lib/schemas/TaskSchema'
import { taskApi } from '@/api/task'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { formatDate } from '@/utils/formatters'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  success: [task: any]
}>()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: taskFormSchema,
  initialValues: {
    status: 'TODO',
    priority: 'MEDIUM',
  },
})

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const onSubmit = handleSubmit(async (values: TaskFormData) => {
  try {
    const task = await taskApi.create(props.projectId, values)
    toast.success('Task created successfully!')
    emit('success', task)
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === 'object' && 'response' in error
        ? (error as any).response?.data?.message
        : 'Failed to create task'
    toast.error(errorMessage)
    throw error
  }
})
</script>
