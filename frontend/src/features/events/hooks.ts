import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEvent,
  fetchEvent,
  fetchEvents,
  updateEvent,
  type CreateEventPayload,
  type UpdateEventPayload,
} from './api'

export function useEvents(page: number, size = 12) {
  return useQuery({
    queryKey: ['events', { page, size }],
    queryFn: () => fetchEvents(page, size),
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateEventPayload) => updateEvent(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.setQueryData(['events', id], data)
    },
  })
}
