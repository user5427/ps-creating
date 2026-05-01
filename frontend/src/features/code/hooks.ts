import { useMutation } from '@tanstack/react-query'
import {
  confirmPurchase,
  generateCode,
  scanCode,
  viewCode,
  type ConfirmPurchasePayload,
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

export function useConfirmPurchase() {
  return useMutation({
    mutationFn: (payload: ConfirmPurchasePayload) => confirmPurchase(payload),
  })
}

export function useViewCode() {
  return useMutation({
    mutationFn: (codeId: string) => viewCode(codeId),
  })
}
