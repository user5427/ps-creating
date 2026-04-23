import { z } from 'zod'

export const EventResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  venue: z.string(),
  imageUrl: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().int().nonnegative(),
  seatsSold: z.number().int().nonnegative(),
  remainingSeats: z.number().int().nonnegative(),
  soldOut: z.boolean(),
  price: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  status: z.string(),
  organizerId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type EventResponse = z.infer<typeof EventResponseSchema>

export const PageSchema = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({
    content: z.array(inner),
    number: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })

export type Page<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export const EventFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required'),
    category: z.string().trim().min(1, 'Category is required').max(64),
    venue: z.string().trim().min(1, 'Venue is required').max(200),
    imageUrl: z
      .string()
      .trim()
      .url('Must be a valid URL')
      .max(500)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    startTime: z.date({ required_error: 'Start time is required' }),
    endTime: z.date({ required_error: 'End time is required' }),
    capacity: z.number({ invalid_type_error: 'Capacity is required' }).int().min(1),
    price: z.number({ invalid_type_error: 'Price is required' }).min(0),
  })
  .refine((v) => v.endTime > v.startTime, {
    path: ['endTime'],
    message: 'End time must be after start time',
  })

export type EventFormValues = z.infer<typeof EventFormSchema>

export const ConflictErrorSchema = z.object({
  code: z.literal('CONFLICT'),
  message: z.string(),
  currentServerState: EventResponseSchema,
})

export const ValidationErrorSchema = z.object({
  code: z.literal('VALIDATION_FAILED'),
  message: z.string(),
  fieldErrors: z.record(z.string()),
})
