import { api } from './client';
import type { Oferta, Paginated, Postulacion } from '@/types';

export interface JobQuery {
  page?: number;
  limit?: number;
  q?: string;
  id_categoria?: number;
  id_empleador?: number;
  ubicacion?: string;
  modalidad?: string;
  tipo_contrato?: string;
  salario_min?: number;
  estado?: string;
}

export type JobInput = Partial<
  Pick<
    Oferta,
    | 'titulo'
    | 'descripcion'
    | 'empresa'
    | 'ubicacion'
    | 'id_categoria'
    | 'modalidad'
    | 'tipo_contrato'
    | 'salario_min'
    | 'salario_max'
    | 'estado'
    | 'fecha_cierre'
  >
>;

export const listJobs = (params: JobQuery): Promise<Paginated<Oferta>> =>
  api.get<Paginated<Oferta>>('/ofertas', { params }).then((r) => r.data);

export const getJob = (id: number): Promise<Oferta> =>
  api.get<Oferta>(`/ofertas/${id}`).then((r) => r.data);

export const listMyJobs = (params: { page?: number; limit?: number }): Promise<Paginated<Oferta>> =>
  api.get<Paginated<Oferta>>('/ofertas/mine', { params }).then((r) => r.data);

export const createJob = (data: JobInput): Promise<{ message: string; oferta: Oferta }> =>
  api.post('/ofertas', data).then((r) => r.data);

export const updateJob = (
  id: number,
  data: JobInput,
): Promise<{ message: string; oferta: Oferta }> =>
  api.patch(`/ofertas/${id}`, data).then((r) => r.data);

export const deleteJob = (id: number): Promise<{ message: string }> =>
  api.delete(`/ofertas/${id}`).then((r) => r.data);

export const listJobApplications = (
  id: number,
  params?: { page?: number; limit?: number },
): Promise<Paginated<Postulacion>> =>
  api.get<Paginated<Postulacion>>(`/ofertas/${id}/applications`, { params }).then((r) => r.data);
