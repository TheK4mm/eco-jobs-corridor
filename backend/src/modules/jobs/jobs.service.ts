import * as jobsRepo from './jobs.repository';
import { forbidden, notFound } from '../../utils/AppError';
import { buildPaginated } from '../../utils/pagination';
import type { AuthPayload, Paginated, PaginationParams } from '../../types/common';
import type { Oferta } from '../../types/models';
import type { CreateJobInput, UpdateJobInput } from './jobs.validation';
import type { JobFilters } from './jobs.repository';

async function ensureOwnerOrAdmin(requester: AuthPayload, jobId: number): Promise<void> {
  const ownerId = await jobsRepo.findOwnerId(jobId);
  if (ownerId === null) throw notFound('Oferta no encontrada');
  if (requester.rol !== 'admin' && ownerId !== requester.id_usuario) {
    throw forbidden('No eres el propietario de esta oferta');
  }
}

/** Listado público: solo ofertas activas (puede filtrarse por empleador). */
export async function listPublic(
  pagination: PaginationParams,
  filters: Omit<JobFilters, 'estado'>,
): Promise<Paginated<Oferta>> {
  const { rows, total } = await jobsRepo.list(pagination, { ...filters, estado: 'activa' });
  return buildPaginated(rows, total, pagination);
}

/** Ofertas del empleador autenticado (cualquier estado). */
export async function listMine(
  empleadorId: number,
  pagination: PaginationParams,
): Promise<Paginated<Oferta>> {
  const { rows, total } = await jobsRepo.list(pagination, { id_empleador: empleadorId });
  return buildPaginated(rows, total, pagination);
}

/** Listado para administración: todas las ofertas (cualquier estado/empleador). */
export async function listAll(
  pagination: PaginationParams,
  filters: JobFilters,
): Promise<Paginated<Oferta>> {
  const { rows, total } = await jobsRepo.list(pagination, filters);
  return buildPaginated(rows, total, pagination);
}

export async function getById(id: number): Promise<Oferta> {
  const oferta = await jobsRepo.findById(id);
  if (!oferta) throw notFound('Oferta no encontrada');
  return oferta;
}

export async function create(requester: AuthPayload, input: CreateJobInput): Promise<Oferta> {
  const id = await jobsRepo.create({
    id_empleador: requester.id_usuario,
    id_categoria: input.id_categoria ?? null,
    titulo: input.titulo,
    descripcion: input.descripcion,
    empresa: input.empresa ?? null,
    ubicacion: input.ubicacion,
    modalidad: input.modalidad,
    tipo_contrato: input.tipo_contrato,
    salario_min: input.salario_min ?? null,
    salario_max: input.salario_max ?? null,
    estado: input.estado,
    fecha_cierre: input.fecha_cierre ?? null,
  });
  return getById(id);
}

export async function update(
  requester: AuthPayload,
  id: number,
  fields: UpdateJobInput,
): Promise<Oferta> {
  await ensureOwnerOrAdmin(requester, id);
  await jobsRepo.update(id, fields);
  return getById(id);
}

export async function remove(requester: AuthPayload, id: number): Promise<void> {
  await ensureOwnerOrAdmin(requester, id);
  await jobsRepo.remove(id);
}
