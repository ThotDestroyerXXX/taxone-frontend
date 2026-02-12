<template>
  <form @submit="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Email Address</FormLabel>
        <FormControl>
          <Input type="email" placeholder="user@example.com" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Enter the email address of the person you want to invite.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

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
        <FormDescription> Select the role for this member. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('cancel')"> Cancel </Button>
      <Button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Sending Invitation...</span>
        <span v-else>Send Invitation</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  workspaceInvitationFormSchema,
  type WorkspaceInvitationFormData,
} from '@/lib/schemas/WorkspaceInvitationSchema'
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
  success: [invitation: any]
}>()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: workspaceInvitationFormSchema,
})

const onSubmit = handleSubmit(async (values: WorkspaceInvitationFormData) => {
  try {
    const invitation = await workspaceApi.inviteMember(props.workspaceId, values)
    toast.success('Invitation sent successfully!')
    emit('success', invitation)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to send invitation')
    throw error
  }
})
</script>
