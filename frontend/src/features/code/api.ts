import apiClient from '../../api/client'
import { CodeResponseSchema, ScanCodeResponseSchema, type CodeResponse, type ScanCodeResponse } from './schemas'

export interface GenerateCodePayload {
  id?: string
  userId: string
  eventId: string
}

export interface ScanCodePayload {
  qrData: string
}

export async function generateCode(payload: GenerateCodePayload): Promise<CodeResponse> {
  const { data } = await apiClient.post('/codes/generate', payload)
  return CodeResponseSchema.parse(data)
}

export async function scanCode(payload: ScanCodePayload): Promise<ScanCodeResponse> {
  const { data } = await apiClient.post('/codes/scan', payload)
  return ScanCodeResponseSchema.parse(data)
}

export async function viewCode(codeId: string): Promise<CodeResponse> {
  const { data } = await apiClient.get(`/codes/${codeId}`)
  return CodeResponseSchema.parse(data)
}
