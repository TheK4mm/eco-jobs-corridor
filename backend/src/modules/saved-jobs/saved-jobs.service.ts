import * as savedRepo from './saved-jobs.repository';
import * as jobsRepo from '../jobs/jobs.repository';
import { notFound } from '../../utils/AppError';
import { buildPaginated } from '../../utils/pagination';
import type { Paginated, PaginationParams } from '../../types/common';
import type { Oferta } from '../../types/models';

export async function save(id_usuario: number, id_oferta: number): Promise<void> {
  const oferta = await jobsRepo.findById(id_oferta);
  if (!oferta) throw notFound('Oferta no encontrada');
  await savedRepo.save(id_usuario, id_oferta);
}

export async function unsave(id_usuario: number, id_oferta: number): Promise<void> {
  await savedRepo.unsave(id_usuario, id_oferta);
}

export function listSavedIds(id_usuario: number): Promise<number[]> {
  return savedRepo.savedIds(id_usuario);
}

export async function listSaved(
  id_usuario: number,
  pagination: PaginationParams,
): Promise<Paginated<Oferta>> {
  const { rows, total } = await savedRepo.listSaved(id_usuario, pagination);
  return buildPaginated(rows, total, pagination);
}
