import { z } from 'zod'
import { PageSchema } from '../events/schemas'

export const CodeUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
})

export const CodeEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  venue: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

export const CodeResponseSchema = z.object({
  id: z.string().uuid(),
  scanCount: z.number().int().nonnegative(),
  qrData: z.string(),
  user: CodeUserSchema,
  event: CodeEventSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ScanCodeResponseSchema = z.object({
  valid: z.boolean(),
  message: z.string(),
  code: CodeResponseSchema.nullable(),
})

export type CodeResponse = z.infer<typeof CodeResponseSchema>
export type ScanCodeResponse = z.infer<typeof ScanCodeResponseSchema>

export const GenerateCodeFormSchema = z.object({
  id: z
    .string()
    .trim()
    .uuid('Code ID must be a valid UUID')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  userId: z.string().trim().uuid('User ID must be a valid UUID'),
  eventId: z.string().trim().uuid('Event ID must be a valid UUID'),
})

export type GenerateCodeFormValues = z.infer<typeof GenerateCodeFormSchema>

export const ViewCodeFormSchema = z.object({
  codeId: z.string().trim().uuid('Code ID must be a valid UUID'),
})

export type ViewCodeFormValues = z.infer<typeof ViewCodeFormSchema>

export const MyTicketEventSummarySchema = z.object({
  eventId: z.string().uuid(),
  eventTitle: z.string(),
  eventStartTime: z.string(),
  eventEndTime: z.string(),
  ticketQuantity: z.number().int().nonnegative(),
})

export const MyTicketEntrySchema = z.object({
  qrData: z.string(),
  scanCount: z.number().int().nonnegative(),
})

export const MyTicketEventsPageSchema = PageSchema(MyTicketEventSummarySchema)
export const MyTicketsByEventResponseSchema = z.object({
  event: CodeEventSchema,
  tickets: PageSchema(MyTicketEntrySchema),
})

export type MyTicketEventsPage = z.infer<typeof MyTicketEventsPageSchema>
export type MyTicketsByEventResponse = z.infer<typeof MyTicketsByEventResponseSchema>
