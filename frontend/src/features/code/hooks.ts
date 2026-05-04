import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchMyTicketGroups,
  fetchMyTicketsByEvent,
  generateCode,
  scanCode,
  viewCode,
  type GenerateCodePayload,
  type ScanCodePayload,
} from './api'

export function useGenerateCode() {
  return useMutation({
    mutationFn: (payload: GenerateCodePayload) => generateCode(payload),
  })
}

export function useScanCode() {
  return useMutation({
    mutationFn: (payload: ScanCodePayload) => scanCode(payload),
  })
}

export function useViewCode() {
  return useMutation({
    mutationFn: (codeId: string) => viewCode(codeId),
  })
}

export function useMyTicketGroups(page: number, size: number) {
  return useQuery({
    queryKey: ['my-tickets', 'groups', page, size],
    queryFn: () => fetchMyTicketGroups(page, size),
  })
}

export function useMyTicketsByEvent(eventId: string | undefined, page: number, size: number) {
  return useQuery({
    queryKey: ['my-tickets', 'event', eventId, page, size],
    queryFn: () => fetchMyTicketsByEvent(eventId!, page, size),
    enabled: !!eventId,
  })
}
