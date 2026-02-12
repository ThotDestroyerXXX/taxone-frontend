import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const workspaceMemberRoleSchema = z.object({
  memberType: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'GUEST'], {
    errorMap: () => ({ message: 'Role should be valid' }),
  }),
})

export type WorkspaceMemberRoleFormData = z.infer<typeof workspaceMemberRoleSchema>

export const workspaceMemberRoleFormSchema = toTypedSchema(workspaceMemberRoleSchema)
