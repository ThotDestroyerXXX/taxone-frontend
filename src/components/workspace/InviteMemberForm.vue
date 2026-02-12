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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
