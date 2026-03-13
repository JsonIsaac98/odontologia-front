import api from './axios'
import type { Cita, EstadoCita, PaginatedResponse } from '@/types'

export interface CitaFilters {
  page?: number
  limit?: number
  fecha?: string
  estado?: EstadoCita
}

export interface CreateCitaDto {
  paciente_id: string
  servicio_id?: string
  fecha_hora: string
  duracion_min?: number
  estado?: EstadoCita
  notas?: string
}

export type UpdateCitaDto = Partial<CreateCitaDto>

export const getCitas = async (filters: CitaFilters = {}): Promise<PaginatedResponse<Cita>> => {
  const res = await api.get<PaginatedResponse<Cita>>('/citas', { params: filters })
  return res.data
}

export const getCitasHoy = async (): Promise<Cita[]> => {
  const res = await api.get<Cita[]>('/citas/hoy')
  return res.data
}

export const getCita = async (id: string): Promise<Cita> => {
  const res = await api.get<Cita>(`/citas/${id}`)
  return res.data
}

export const createCita = async (data: CreateCitaDto): Promise<Cita> => {
  const res = await api.post<Cita>('/citas', data)
  return res.data
}

export const updateCita = async (id: string, data: UpdateCitaDto): Promise<Cita> => {
  const res = await api.patch<Cita>(`/citas/${id}`, data)
  return res.data
}

export const deleteCita = async (id: string): Promise<void> => {
  await api.delete(`/citas/${id}`)
}
