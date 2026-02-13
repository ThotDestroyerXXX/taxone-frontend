import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be valid' }),
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    errorMap: () => ({ message: 'Priority must be valid' }),
  }),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be at least 0').optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  parentTaskId: z.string().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>

export const taskFormSchema = toTypedSchema(taskSchema)
