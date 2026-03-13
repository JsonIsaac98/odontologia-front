import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getServicios,
  createServicio,
  updateServicio,
  deleteServicio,
  type CreateServicioDto,
  type UpdateServicioDto,
} from '@/api/servicios.api'

export const useServicios = () =>
  useQuery({
    queryKey: ['servicios'],
    queryFn: getServicios,
  })

export const useCreateServicio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateServicioDto) => createServicio(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicios'] }),
  })
}

export const useUpdateServicio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServicioDto }) => updateServicio(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicios'] }),
  })
}

export const useDeleteServicio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteServicio(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicios'] }),
  })
}
