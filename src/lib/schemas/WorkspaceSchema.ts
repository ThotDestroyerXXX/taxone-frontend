import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be at most 200 characters'),
  description: z.string().min(1, 'Description is required'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(200, 'Slug must be at most 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  logoUrl: z
    .string()
    .min(2, 'Logo URL must be at least 2 characters')
    .max(200, 'Logo URL must be at most 200 characters')
    .url('Logo URL must be a valid URL')
    .optional()
    .or(z.literal('')),
})

export type WorkspaceFormData = z.infer<typeof workspaceSchema>

export const workspaceFormSchema = toTypedSchema(workspaceSchema)
