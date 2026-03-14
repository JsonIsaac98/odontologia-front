import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWhatsAppStatus, getWhatsAppQr, disconnectWhatsApp } from '@/api/whatsapp.api'

export const useWhatsAppStatus = (refetchInterval?: number) =>
  useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: getWhatsAppStatus,
    refetchInterval: refetchInterval ?? 30000,
  })

export const useWhatsAppQr = (enabled: boolean) =>
  useQuery({
    queryKey: ['whatsapp', 'qr'],
    queryFn: getWhatsAppQr,
    enabled,
    refetchInterval: 30000,
    retry: false,
  })

export const useDisconnectWhatsApp = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: disconnectWhatsApp,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp'] })
    },
  })
}
