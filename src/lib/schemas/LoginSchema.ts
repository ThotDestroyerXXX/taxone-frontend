import { toTypedSchema } from '@vee-validate/zod'
import z from 'zod'

export const loginSchema = toTypedSchema(
  z.object({
    email: z.string({ message: 'email is required' }).email('Invalid email address'),
    password: z
      .string({ message: 'password is required' })
      .min(8, 'Password must be at least 8 characters long'),
  }),
)
