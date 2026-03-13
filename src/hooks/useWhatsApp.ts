import { useQuery } from '@tanstack/react-query'
import { getWhatsAppStatus } from '@/api/whatsapp.api'

export const useWhatsAppStatus = () =>
  useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: getWhatsAppStatus,
    refetchInterval: 30000,
  })
