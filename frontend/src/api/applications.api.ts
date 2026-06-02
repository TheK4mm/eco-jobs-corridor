import { api } from './client';
import type { EstadoPostulacion, Paginated, Postulacion } from '@/types';

export const apply = (
  id_oferta: number,
  mensaje?: string,
): Promise<{ message: string; postulacion: Postulacion }> =>
  api.post('/postulaciones', { id_oferta, mensaje }).then((r) => r.data);

export const listMyApplications = (params: {
  page?: number;
  limit?: number;
}): Promise<Paginated<Postulacion>> =>
  api.get<Paginated<Postulacion>>('/postulaciones/mine', { params }).then((r) => r.data);

export const updateApplicationStatus = (
  id: number,
  estado: EstadoPostulacion,
): Promise<{ message: string; postulacion: Postulacion }> =>
  api.patch(`/postulaciones/${id}/status`, { estado }).then((r) => r.data);

export const withdrawApplication = (id: number): Promise<{ message: string }> =>
  api.delete(`/postulaciones/${id}`).then((r) => r.data);
