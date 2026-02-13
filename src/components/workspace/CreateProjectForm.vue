<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Project Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="My Project" v-bind="componentField" />
        </FormControl>
        <FormDescription> The name of your project (2-100 characters). </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="projectKey">
      <FormItem>
        <FormLabel>Project Key</FormLabel>
        <FormControl>
          <Input type="text" placeholder="PROJ" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Unique identifier for the project (3-20 uppercase characters).
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Project description" v-bind="componentField" />
        </FormControl>
        <FormDescription> Brief description of your project. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-2 gap-4">
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

      <FormField v-slot="{ componentField }" name="color">
        <FormItem>
          <FormLabel>Color</FormLabel>
          <FormControl>
            <Input type="text" placeholder="#A1B2C3" v-bind="componentField" />
          </FormControl>
          <FormDescription> Hex color code (e.g., #A1B2C3). </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <FormField v-slot="{ componentField, value }" name="startDate">
        <FormItem class="flex flex-col">
          <FormLabel>Start Date</FormLabel>
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
                      componentField.modelValue = ''
                    }
                  }
                "
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, value }" name="endDate">
        <FormItem class="flex flex-col">
          <FormLabel>End Date</FormLabel>
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
                      componentField.modelValue = ''
                    }
                  }
                "
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ value, handleChange }" name="isPublic">
      <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <FormControl>
          <Checkbox :checked="value" @update:checked="handleChange" />
        </FormControl>
        <div class="space-y-1 leading-none">
          <FormLabel>Public Project</FormLabel>
          <FormDescription>
            Make this project visible to everyone in the workspace.
          </FormDescription>
        </div>
      </FormItem>
      <FormMessage />
    </FormField>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('cancel')"> Cancel </Button>
      <Button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Creating...</span>
        <span v-else>Create Project</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { projectFormSchema, type ProjectFormData } from '@/lib/schemas/ProjectSchema'
import { workspaceApi } from '@/api/workspace'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { formatDate } from '@/utils/formatters'

interface Props {
  workspaceId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  success: [project: any]
}>()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: projectFormSchema,
  initialValues: {
    isPublic: false,
  },
})

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const onSubmit = handleSubmit(async (values: ProjectFormData) => {
  try {
    const project = await workspaceApi.createProject(props.workspaceId, values)
    toast.success('Project created successfully!')
    emit('success', project)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to create project')
    throw error
  }
})
</script>
