import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  claimFreeTickets,
  createCheckoutPaymentIntent,
  createEvent,
  fetchCheckoutPaymentStatus,
  fetchEvent,
  fetchEvents,
  updateEvent,
  type ClaimFreeTicketsPayload,
  type CreateCheckoutPaymentIntentPayload,
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

export function useCreateCheckoutPaymentIntent(eventId: string) {
  return useMutation({
    mutationFn: (payload: CreateCheckoutPaymentIntentPayload) =>
      createCheckoutPaymentIntent(eventId, payload),
  })
}

export function useCheckoutPaymentStatus(paymentIntentId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['checkout-payment-status', paymentIntentId],
    queryFn: () => fetchCheckoutPaymentStatus(paymentIntentId!),
    enabled: enabled && !!paymentIntentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'INITIATED' || status === 'PAYMENT_SUCCEEDED' ? 1500 : false
    },
  })
}

export function useClaimFreeTickets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClaimFreeTicketsPayload) => claimFreeTickets(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['events', variables.eventId] })
      qc.invalidateQueries({ queryKey: ['my-tickets'] })
    },
  })
}
