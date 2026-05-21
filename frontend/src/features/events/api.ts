import apiClient from '../../api/client'
import {
  CheckoutPaymentStatusResponseSchema,
  ClaimFreeTicketsResponseSchema,
  CreateCheckoutPaymentIntentResponseSchema,
  EventCategoryListSchema,
  EventDashboardResponseSchema,
  EventResponseSchema,
  PageSchema,
  type CheckoutPaymentStatusResponse,
  type ClaimFreeTicketsResponse,
  type CreateCheckoutPaymentIntentResponse,
  type EventDashboardResponse,
  type EventResponse,
  type Page,
} from './schemas'

export interface CreateEventPayload {
  title: string
  description: string
  category: string
  venue: string
  imageUrl?: string
  startTime: string
  endTime: string
  capacity: number
  price: number
}

export interface UpdateEventPayload extends CreateEventPayload {
  version: number
}

export type EventListSort = 'NEW' | 'PRICE_ASC' | 'PRICE_DESC'

export interface EventListFilters {
  category: string
  location: string
  startDate: string
  endDate: string
  sortBy: EventListSort
}

const SORT_TO_API: Record<EventListSort, string> = {
  NEW: 'createdAt,desc',
  PRICE_ASC: 'price,asc',
  PRICE_DESC: 'price,desc',
}

export interface CreateCheckoutPaymentIntentPayload {
  quantity: number
}

export interface ClaimFreeTicketsPayload {
  eventId: string
  quantity: number
}

export async function fetchEvents(
  page: number,
  size: number,
  filters: EventListFilters,
): Promise<Page<EventResponse>> {
  const { data } = await apiClient.get('/events', {
    params: {
      page,
      size,
      category: filters.category || undefined,
      location: filters.location || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      sort: SORT_TO_API[filters.sortBy],
    },
  })
  return PageSchema(EventResponseSchema).parse(data)
}

export async function fetchEventCategories(): Promise<string[]> {
  const { data } = await apiClient.get('/events/categories')
  return EventCategoryListSchema.parse(data)
}

export async function fetchOrganizerEvents(
  page: number,
  size: number,
): Promise<Page<EventDashboardResponse>> {
  const { data } = await apiClient.get('/events/me', { params: { page, size } })
  return PageSchema(EventDashboardResponseSchema).parse(data)
}

export async function fetchEvent(id: string): Promise<EventResponse> {
  const { data } = await apiClient.get(`/events/${id}`)
  return EventResponseSchema.parse(data)
}

export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  const { data } = await apiClient.post('/events', payload)
  return EventResponseSchema.parse(data)
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
): Promise<EventResponse> {
  const { data } = await apiClient.put(`/events/${id}`, payload)
  return EventResponseSchema.parse(data)
}

export async function createCheckoutPaymentIntent(
  eventId: string,
  payload: CreateCheckoutPaymentIntentPayload,
): Promise<CreateCheckoutPaymentIntentResponse> {
  const { data } = await apiClient.post(
    `/events/${eventId}/checkout/payment-intents`,
    payload,
  )
  return CreateCheckoutPaymentIntentResponseSchema.parse(data)
}

export async function fetchCheckoutPaymentStatus(
  paymentIntentId: string,
): Promise<CheckoutPaymentStatusResponse> {
  const { data } = await apiClient.get(
    `/checkout/payment-intents/${paymentIntentId}`,
  )
  return CheckoutPaymentStatusResponseSchema.parse(data)
}

export async function claimFreeTickets(
  payload: ClaimFreeTicketsPayload,
): Promise<ClaimFreeTicketsResponse> {
  const { data } = await apiClient.post('/tickets/claim-free', payload)
  return ClaimFreeTicketsResponseSchema.parse(data)
}
