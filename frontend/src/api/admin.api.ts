import { api } from './client';
import type { AdminStats, Oferta, Paginated, Rol, Usuario } from '@/types';
import type { JobQuery } from './jobs.api';

export const getStats = (): Promise<AdminStats> =>
  api.get<AdminStats>('/admin/stats').then((r) => r.data);

export const listAllJobs = (params: JobQuery): Promise<Paginated<Oferta>> =>
  api.get<Paginated<Oferta>>('/admin/ofertas', { params }).then((r) => r.data);

// ── Gestión de usuarios (admin) ─────────────────────────────────────────
export interface UserQuery {
  page?: number;
  limit?: number;
  rol?: Rol;
  q?: string;
  activo?: 'true' | 'false';
}

export const listUsers = (params: UserQuery): Promise<Paginated<Usuario>> =>
  api.get<Paginated<Usuario>>('/usuarios', { params }).then((r) => r.data);

export const updateUserRole = (
  id: number,
  rol: Rol,
): Promise<{ message: string; user: Usuario }> =>
  api.patch(`/usuarios/${id}/role`, { rol }).then((r) => r.data);

export const updateUserStatus = (
  id: number,
  activo: boolean,
): Promise<{ message: string; user: Usuario }> =>
  api.patch(`/usuarios/${id}/status`, { activo }).then((r) => r.data);

export const deleteUser = (id: number): Promise<{ message: string }> =>
  api.delete(`/usuarios/${id}`).then((r) => r.data);
