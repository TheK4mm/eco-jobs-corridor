import { api } from './client';
import type { Categoria } from '@/types';

export const listCategories = (): Promise<Categoria[]> =>
  api.get<Categoria[]>('/categorias').then((r) => r.data);

export const createCategory = (nombre: string): Promise<{ message: string; categoria: Categoria }> =>
  api.post('/categorias', { nombre }).then((r) => r.data);

export const updateCategory = (
  id: number,
  nombre: string,
): Promise<{ message: string; categoria: Categoria }> =>
  api.patch(`/categorias/${id}`, { nombre }).then((r) => r.data);

export const deleteCategory = (id: number): Promise<{ message: string }> =>
  api.delete(`/categorias/${id}`).then((r) => r.data);

export const listSkills = (): Promise<Categoria[]> =>
  api.get<Categoria[]>('/perfiles/habilidades').then((r) => r.data);
