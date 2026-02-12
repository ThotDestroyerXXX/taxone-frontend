import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const projectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string().min(1, 'Description is required'),
  projectKey: z
    .string()
    .min(3, 'Project key must be at least 3 characters')
    .max(20, 'Project key must be at most 20 characters')
    .regex(
      /^[A-Z0-9-_]+$/,
      'Project key must contain only uppercase letters, numbers, hyphens, and underscores',
    ),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    errorMap: () => ({ message: 'Priority should be valid' }),
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g. #A1B2C3)'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in yyyy-MM-dd format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in yyyy-MM-dd format'),
  isPublic: z.boolean({
    required_error: 'Publicity is required',
  }),
})

export type ProjectFormData = z.infer<typeof projectSchema>

export const projectFormSchema = toTypedSchema(projectSchema)
