import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phoneNumber: z.string(),
  createdAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
})

export type CreateUser = z.infer<typeof CreateUserSchema>

export const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  currency: z.string().lowercase(),
  status: z.enum(['pending', 'succeeded', 'failed']),
  createdAt: z.string().datetime(),
})

export type Payment = z.infer<typeof PaymentSchema>
