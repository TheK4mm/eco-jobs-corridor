import * as repo from './categories.repository';
import { notFound } from '../../utils/AppError';
import type { Categoria } from '../../types/models';

export function list(): Promise<Categoria[]> {
  return repo.list();
}

export async function create(nombre: string): Promise<Categoria> {
  const id = await repo.create(nombre);
  return { id_categoria: id, nombre };
}

export async function update(id: number, nombre: string): Promise<Categoria> {
  const affected = await repo.update(id, nombre);
  if (!affected) throw notFound('Categoría no encontrada');
  return { id_categoria: id, nombre };
}

export async function remove(id: number): Promise<void> {
  const affected = await repo.remove(id);
  if (!affected) throw notFound('Categoría no encontrada');
}
