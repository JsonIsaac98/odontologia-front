import api from './axios'
import type { Paciente, PaginatedResponse } from '@/types'

export interface PacienteFilters {
  page?: number
  limit?: number
  search?: string
}

export interface CreatePacienteDto {
  nombre: string
  apellido: string
  telefono: string
  whatsapp: string
  fecha_nacimiento?: string
  genero?: string
  notas?: string
}

export type UpdatePacienteDto = Partial<CreatePacienteDto>

export const getPacientes = async (filters: PacienteFilters = {}): Promise<PaginatedResponse<Paciente>> => {
  const res = await api.get<PaginatedResponse<Paciente>>('/pacientes', { params: filters })
  return res.data
}

export const getPaciente = async (id: string): Promise<Paciente> => {
  const res = await api.get<Paciente>(`/pacientes/${id}`)
  return res.data
}

export const createPaciente = async (data: CreatePacienteDto): Promise<Paciente> => {
  const res = await api.post<Paciente>('/pacientes', data)
  return res.data
}

export const updatePaciente = async (id: string, data: UpdatePacienteDto): Promise<Paciente> => {
  const res = await api.patch<Paciente>(`/pacientes/${id}`, data)
  return res.data
}

export const deletePaciente = async (id: string): Promise<void> => {
  await api.delete(`/pacientes/${id}`)
}
