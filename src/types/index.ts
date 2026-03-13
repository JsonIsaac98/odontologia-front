export interface Paciente {
  id: string
  nombre: string
  apellido: string
  telefono: string
  whatsapp: string
  fecha_nacimiento?: string
  genero?: string
  notas?: string
  created_at: string
}

export interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracion_min: number
  activo: boolean
}

export type EstadoCita = 'programada' | 'completada' | 'cancelada' | 'no_asistio'

export interface Cita {
  id: string
  paciente: Paciente
  paciente_id: string
  servicio?: Servicio
  servicio_id?: string
  fecha_hora: string
  duracion_min: number
  estado: EstadoCita
  notas?: string
  recordatorio_enviado: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'dentista'
}

export interface AuthResponse {
  access_token: string
  usuario: Usuario
}

export interface WhatsAppStatus {
  connected: boolean
  message: string
}
