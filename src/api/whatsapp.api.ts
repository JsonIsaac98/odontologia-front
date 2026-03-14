import api from './axios'
import type { WhatsAppStatus } from '@/types'

export const getWhatsAppStatus = async (): Promise<WhatsAppStatus> => {
  const res = await api.get<WhatsAppStatus>('/whatsapp/status')
  return res.data
}

/** Descarga la imagen PNG del QR y la convierte a blob URL para el <img> */
export const getWhatsAppQr = async (): Promise<string> => {
  const res = await api.get('/whatsapp/qr', { responseType: 'blob' })
  return URL.createObjectURL(res.data as Blob)
}

export const disconnectWhatsApp = async (): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>('/whatsapp/session')
  return res.data
}
