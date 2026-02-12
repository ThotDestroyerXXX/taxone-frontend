<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="memberType">
      <FormItem>
        <FormLabel>Role</FormLabel>
        <FormControl>
          <select
            v-bind="componentField"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a role</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
            <option value="GUEST">Guest</option>
          </select>
        </FormControl>
        <FormDescription> Select the new role for this member. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('cancel')"> Cancel </Button>
      <Button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Updating...</span>
        <span v-else>Update Role</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  workspaceMemberRoleFormSchema,
  type WorkspaceMemberRoleFormData,
} from '@/lib/schemas/WorkspaceMemberRoleSchema'
import { workspaceApi } from '@/api/workspace'
import type { WorkspaceMemberResponse } from '@/types/workspace'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'

interface Props {
  workspaceId: string
  member: WorkspaceMemberResponse
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  success: [member: WorkspaceMemberResponse]
}>()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: workspaceMemberRoleFormSchema,
  initialValues: {
    memberType: props.member.memberType,
  },
})

const onSubmit = handleSubmit(async (values: WorkspaceMemberRoleFormData) => {
  try {
    const member = await workspaceApi.updateMemberRole(props.workspaceId, props.member.id, values)
    toast.success('Member role updated successfully!')
    emit('success', member)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to update member role')
    throw error
  }
})
</script>
