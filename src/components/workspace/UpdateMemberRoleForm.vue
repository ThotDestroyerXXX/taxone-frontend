<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="memberType">
      <FormItem>
        <FormLabel>Role</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="OWNER">Owner</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
            <SelectItem value="GUEST">Guest</SelectItem>
          </SelectContent>
        </Select>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
