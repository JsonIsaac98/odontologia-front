import api from './axios'
import type { Servicio, PaginatedResponse } from '@/types'

export interface CreateServicioDto {
  nombre: string
  descripcion?: string
  precio: number
  duracion_min: number
  activo?: boolean
}

export type UpdateServicioDto = Partial<CreateServicioDto>

export const getServicios = async (): Promise<PaginatedResponse<Servicio>> => {
  const res = await api.get<PaginatedResponse<Servicio>>('/servicios', { params: { limit: 100 } })
  return res.data
}

export const getServicio = async (id: string): Promise<Servicio> => {
  const res = await api.get<Servicio>(`/servicios/${id}`)
  return res.data
}

export const createServicio = async (data: CreateServicioDto): Promise<Servicio> => {
  const res = await api.post<Servicio>('/servicios', data)
  return res.data
}

export const updateServicio = async (id: string, data: UpdateServicioDto): Promise<Servicio> => {
  const res = await api.patch<Servicio>(`/servicios/${id}`, data)
  return res.data
}

export const deleteServicio = async (id: string): Promise<void> => {
  await api.delete(`/servicios/${id}`)
}
