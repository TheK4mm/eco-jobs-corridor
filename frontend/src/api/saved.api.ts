import { api } from './client';
import type { Oferta, Paginated } from '@/types';

export const listSavedJobs = (params?: {
  page?: number;
  limit?: number;
}): Promise<Paginated<Oferta>> =>
  api.get<Paginated<Oferta>>('/guardados', { params }).then((r) => r.data);

export const listSavedIds = (): Promise<number[]> =>
  api.get<{ ids: number[] }>('/guardados/ids').then((r) => r.data.ids);

export const saveJob = (id: number): Promise<{ message: string }> =>
  api.post(`/guardados/${id}`).then((r) => r.data);

export const unsaveJob = (id: number): Promise<{ message: string }> =>
  api.delete(`/guardados/${id}`).then((r) => r.data);
