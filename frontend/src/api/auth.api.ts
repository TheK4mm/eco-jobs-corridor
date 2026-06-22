import { api } from './client';
import type { Rol, Usuario } from '@/types';

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
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

/** Revoca el refresh token en el servidor (cierre de sesión real). */
export const logout = (refreshToken: string): Promise<void> =>
  api.post('/auth/logout', { refreshToken }).then(() => undefined);

/** Solicita el envío de instrucciones de recuperación. Respuesta neutra.
 * En desarrollo, el backend puede devolver `resetToken` para facilitar pruebas. */
export const forgotPassword = (email: string): Promise<{ message: string; resetToken?: string }> =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token: string, contrasena: string): Promise<{ message: string }> =>
  api.post('/auth/reset-password', { token, contrasena }).then((r) => r.data);
