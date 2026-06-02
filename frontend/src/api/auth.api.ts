import { api } from './client';
import type { Rol, Usuario } from '@/types';

export interface LoginResponse {
  message: string;
  token: string;
  user: Usuario;
}

export const login = (email: string, contrasena: string): Promise<LoginResponse> =>
  api.post<LoginResponse>('/auth/login', { email, contrasena }).then((r) => r.data);

export const register = (data: {
  nombre: string;
  email: string;
  contrasena: string;
  rol: Rol;
}): Promise<{ message: string; user: Usuario }> =>
  api.post('/auth/register', data).then((r) => r.data);

export const getMe = (): Promise<Usuario> => api.get<Usuario>('/auth/me').then((r) => r.data);
