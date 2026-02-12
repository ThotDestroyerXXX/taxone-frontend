import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const workspaceInvitationSchema = z.object({
  email: z.string().email('Email must be valid'),
  memberType: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'GUEST'], {
    errorMap: () => ({ message: 'Role should be valid' }),
  }),
})

export type WorkspaceInvitationFormData = z.infer<typeof workspaceInvitationSchema>

export const workspaceInvitationFormSchema = toTypedSchema(workspaceInvitationSchema)
