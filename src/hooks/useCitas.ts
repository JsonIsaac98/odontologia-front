import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCitas,
  getCitasHoy,
  createCita,
  updateCita,
  deleteCita,
  enviarRecordatorio,
  type CitaFilters,
  type CreateCitaDto,
  type UpdateCitaDto,
} from '@/api/citas.api'

export const useCitas = (filters: CitaFilters = {}) =>
  useQuery({
    queryKey: ['citas', filters],
    queryFn: () => getCitas(filters),
  })

export const useCitasHoy = () =>
  useQuery({
    queryKey: ['citas', 'hoy'],
    queryFn: getCitasHoy,
  })

export const useCitasMes = (year: number, month: number) =>
  useQuery({
    queryKey: ['citas', 'mes', year, month],
    queryFn: () => getCitas({ page: 1, limit: 300 }),
    select: (data) =>
      data.data.filter((c) => {
        const d = new Date(c.fecha_hora)
        return d.getFullYear() === year && d.getMonth() === month
      }),
  })

export const useCreateCita = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCitaDto) => createCita(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['citas'] }),
  })
}

export const useUpdateCita = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCitaDto }) => updateCita(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['citas'] }),
  })
}

export const useDeleteCita = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCita(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['citas'] }),
  })
}

export const useEnviarRecordatorio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => enviarRecordatorio(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['citas'] }),
  })
}
