import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPacientes,
  getPaciente,
  createPaciente,
  updatePaciente,
  deletePaciente,
  type PacienteFilters,
  type CreatePacienteDto,
  type UpdatePacienteDto,
} from '@/api/pacientes.api'

export const usePacientes = (filters: PacienteFilters = {}) =>
  useQuery({
    queryKey: ['pacientes', filters],
    queryFn: () => getPacientes(filters),
  })

export const usePaciente = (id: string) =>
  useQuery({
    queryKey: ['pacientes', id],
    queryFn: () => getPaciente(id),
    enabled: !!id,
  })

export const useCreatePaciente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePacienteDto) => createPaciente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pacientes'] }),
  })
}

export const useUpdatePaciente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePacienteDto }) => updatePaciente(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pacientes'] }),
  })
}

export const useDeletePaciente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePaciente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pacientes'] }),
  })
}
