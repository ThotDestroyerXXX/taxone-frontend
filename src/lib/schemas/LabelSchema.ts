import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const labelSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g. #A1B2C3)'),
  description: z.string().min(1, 'Description is required'),
})

export type LabelFormData = z.infer<typeof labelSchema>

export const labelFormSchema = toTypedSchema(labelSchema)
