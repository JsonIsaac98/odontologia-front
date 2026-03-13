import api from './axios'
import type { AuthResponse } from '@/types'

export interface LoginDto {
  email: string
  password: string
}

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', data)
  return res.data
}
