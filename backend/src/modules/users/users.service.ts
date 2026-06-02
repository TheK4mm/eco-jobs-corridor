import * as usersRepo from './users.repository';
import { hashPassword } from '../../utils/password';
import { conflict, forbidden, notFound } from '../../utils/AppError';
import { buildPaginated } from '../../utils/pagination';
import type { AuthPayload, Paginated, PaginationParams, Rol } from '../../types/common';
import type { UsuarioPublico } from '../../types/models';
import type { UpdateUserInput } from './users.validation';

function ensureSelfOrAdmin(requester: AuthPayload, targetId: number): void {
  if (requester.rol !== 'admin' && requester.id_usuario !== targetId) {
    throw forbidden('Solo puedes gestionar tu propia cuenta');
  }
}

export async function getById(requester: AuthPayload, id: number): Promise<UsuarioPublico> {
  ensureSelfOrAdmin(requester, id);
  const user = await usersRepo.findById(id);
  if (!user) throw notFound('Usuario no encontrado');
  return user;
}

export async function update(
  requester: AuthPayload,
  id: number,
  input: UpdateUserInput,
): Promise<UsuarioPublico> {
  ensureSelfOrAdmin(requester, id);

  const existing = await usersRepo.findById(id);
  if (!existing) throw notFound('Usuario no encontrado');

  if (input.email && (await usersRepo.emailExists(input.email, id))) {
    throw conflict('El correo ya está en uso por otra cuenta');
  }

  await usersRepo.updateBasic(id, { nombre: input.nombre, email: input.email });
  if (input.contrasena) {
    await usersRepo.updatePassword(id, await hashPassword(input.contrasena));
  }

  return (await usersRepo.findById(id)) as UsuarioPublico;
}

export async function updateRole(id: number, rol: Rol): Promise<UsuarioPublico> {
  const existing = await usersRepo.findById(id);
  if (!existing) throw notFound('Usuario no encontrado');
  await usersRepo.updateRole(id, rol);
  return (await usersRepo.findById(id)) as UsuarioPublico;
}

export async function updateStatus(id: number, activo: boolean): Promise<UsuarioPublico> {
  const existing = await usersRepo.findById(id);
  if (!existing) throw notFound('Usuario no encontrado');
  await usersRepo.setActivo(id, activo);
  return (await usersRepo.findById(id)) as UsuarioPublico;
}

export async function remove(requester: AuthPayload, id: number): Promise<void> {
  ensureSelfOrAdmin(requester, id);
  const existing = await usersRepo.findById(id);
  if (!existing) throw notFound('Usuario no encontrado');
  await usersRepo.remove(id);
}

export async function list(
  pagination: PaginationParams,
  filters: { rol?: Rol; q?: string; activo?: boolean },
): Promise<Paginated<UsuarioPublico>> {
  const { rows, total } = await usersRepo.list(pagination, filters);
  return buildPaginated(rows, total, pagination);
}
