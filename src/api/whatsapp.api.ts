import api from './axios'
import type { WhatsAppStatus } from '@/types'

export const getWhatsAppStatus = async (): Promise<WhatsAppStatus> => {
  const res = await api.get<WhatsAppStatus>('/whatsapp/status')
  return res.data
}
