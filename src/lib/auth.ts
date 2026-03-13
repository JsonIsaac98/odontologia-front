import type { Usuario } from '@/types'

export const getToken = (): string | null => localStorage.getItem('token')

export const getUsuario = (): Usuario | null => {
  const raw = localStorage.getItem('usuario')
  if (!raw) return null
  try {
    return JSON.parse(raw) as Usuario
  } catch {
    return null
  }
}

export const setAuth = (token: string, usuario: Usuario): void => {
  localStorage.setItem('token', token)
  localStorage.setItem('usuario', JSON.stringify(usuario))
}

export const clearAuth = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

export const isAuthenticated = (): boolean => !!getToken()
