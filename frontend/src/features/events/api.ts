import apiClient from '../../api/client'
import {
  EventResponseSchema,
  PageSchema,
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

export async function fetchEvents(page: number, size: number): Promise<Page<EventResponse>> {
  const { data } = await apiClient.get('/events', { params: { page, size } })
  return PageSchema(EventResponseSchema).parse(data)
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
