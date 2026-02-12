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
          <FormControl>
            <select
              v-bind="componentField"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </FormControl>
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
      <FormField v-slot="{ componentField }" name="startDate">
        <FormItem>
          <FormLabel>Start Date</FormLabel>
          <FormControl>
            <Input type="date" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="endDate">
        <FormItem>
          <FormLabel>End Date</FormLabel>
          <FormControl>
            <Input type="date" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ value, handleChange }" name="isPublic">
      <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <FormControl>
          <input
            type="checkbox"
            :checked="value"
            @change="handleChange"
            class="h-4 w-4 rounded border-gray-300"
          />
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
