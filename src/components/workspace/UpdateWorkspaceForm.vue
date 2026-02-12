<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Workspace Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="My Workspace" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          This is your workspace's display name (2-200 characters).
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="slug">
      <FormItem>
        <FormLabel>Slug</FormLabel>
        <FormControl>
          <Input type="text" placeholder="my-workspace" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          URL-friendly identifier (lowercase letters, numbers, and hyphens only).
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Description of your workspace" v-bind="componentField" />
        </FormControl>
        <FormDescription> Brief description of your workspace. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="logoUrl">
      <FormItem>
        <FormLabel>Logo URL (Optional)</FormLabel>
        <FormControl>
          <Input type="url" placeholder="https://example.com/logo.png" v-bind="componentField" />
        </FormControl>
        <FormDescription> URL to your workspace logo image. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('cancel')"> Cancel </Button>
      <Button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Updating...</span>
        <span v-else>Update Workspace</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { workspaceFormSchema, type WorkspaceFormData } from '@/lib/schemas/WorkspaceSchema'
import { workspaceApi } from '@/api/workspace'
import type { WorkspaceResponse } from '@/types/workspace'
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
  workspace: WorkspaceResponse
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  success: [workspace: WorkspaceResponse]
}>()

const { handleSubmit, isSubmitting, setValues } = useForm({
  validationSchema: workspaceFormSchema,
  initialValues: {
    name: props.workspace.name,
    description: props.workspace.description || '',
    slug: props.workspace.slug,
    logoUrl: props.workspace.logoUrl || '',
  },
})

const onSubmit = handleSubmit(async (values: WorkspaceFormData) => {
  try {
    const workspace = await workspaceApi.update(props.workspace.id, values)
    toast.success('Workspace updated successfully!')
    emit('success', workspace)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to update workspace')
    throw error
  }
})
</script>
