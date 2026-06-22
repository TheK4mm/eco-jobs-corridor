import { api } from './client';
import type { Alerta } from '@/types';

export interface AlertInput {
  palabra_clave?: string;
  id_categoria?: number;
  modalidad?: string;
}

export const listAlerts = (): Promise<Alerta[]> =>
  api.get<Alerta[]>('/alertas').then((r) => r.data);

export const createAlert = (data: AlertInput): Promise<{ message: string; alertas: Alerta[] }> =>
  api.post('/alertas', data).then((r) => r.data);

export const deleteAlert = (id: number): Promise<{ message: string }> =>
  api.delete(`/alertas/${id}`).then((r) => r.data);
