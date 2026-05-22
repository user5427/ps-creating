import apiClient from '../../api/client'
import {
  CheckoutPaymentStatusResponseSchema,
  ClaimFreeTicketsResponseSchema,
  CreateCheckoutPaymentIntentResponseSchema,
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

export interface CreateCheckoutPaymentIntentPayload {
  quantity: number
}

export interface ClaimFreeTicketsPayload {
  eventId: string
  quantity: number
}

// Derive backend root (strip a trailing /api if present) so we can call
// server-root endpoints reliably (some controllers are mounted at /auth,
// others under /api). This keeps behavior consistent regardless of how
// VITE_API_URL was configured.
const CONFIGURED_API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const BACKEND_ROOT = CONFIGURED_API.replace(/\/api\/?$/, '')

export async function fetchEvents(page: number, size: number): Promise<Page<EventResponse>> {
  const url = `${BACKEND_ROOT}/api/events`
  const { data } = await apiClient.get(url, { params: { page, size } })
  return PageSchema(EventResponseSchema).parse(data)
}

export async function fetchOrganizerEvents(
  page: number,
  size: number,
): Promise<Page<EventDashboardResponse>> {
  const url = `${BACKEND_ROOT}/api/events/me`
  const { data } = await apiClient.get(url, { params: { page, size } })
  return PageSchema(EventDashboardResponseSchema).parse(data)
}

export async function fetchEvent(id: string): Promise<EventResponse> {
  const url = `${BACKEND_ROOT}/api/events/${id}`
  const { data } = await apiClient.get(url)
  return EventResponseSchema.parse(data)
}

export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  const url = `${BACKEND_ROOT}/api/events`
  const { data } = await apiClient.post(url, payload)
  return EventResponseSchema.parse(data)
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
): Promise<EventResponse> {
  const url = `${BACKEND_ROOT}/api/events/${id}`
  const { data } = await apiClient.put(url, payload)
  return EventResponseSchema.parse(data)
}

export async function createCheckoutPaymentIntent(
  eventId: string,
  payload: CreateCheckoutPaymentIntentPayload,
): Promise<CreateCheckoutPaymentIntentResponse> {
  const url = `${BACKEND_ROOT}/api/events/${eventId}/checkout/payment-intents`
  const { data } = await apiClient.post(url, payload)
  return CreateCheckoutPaymentIntentResponseSchema.parse(data)
}

export async function fetchCheckoutPaymentStatus(
  paymentIntentId: string,
): Promise<CheckoutPaymentStatusResponse> {
  const url = `${BACKEND_ROOT}/api/checkout/payment-intents/${paymentIntentId}`
  const { data } = await apiClient.get(url)
  return CheckoutPaymentStatusResponseSchema.parse(data)
}

export async function claimFreeTickets(
  payload: ClaimFreeTicketsPayload,
): Promise<ClaimFreeTicketsResponse> {
  const url = `${BACKEND_ROOT}/api/tickets/claim-free`
  const { data } = await apiClient.post(url, payload)
  return ClaimFreeTicketsResponseSchema.parse(data)
}
