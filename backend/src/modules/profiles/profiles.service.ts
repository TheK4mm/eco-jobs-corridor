import * as repo from './profiles.repository';
import * as usersRepo from '../users/users.repository';
import { notFound } from '../../utils/AppError';
import type { CandidatoProfileInput, EmpleadorProfileInput } from './profiles.validation';
import type { Categoria, PerfilCandidato, PerfilEmpleador, UsuarioPublico } from '../../types/models';

export interface CandidatoProfileView {
  usuario: UsuarioPublico;
  perfil: PerfilCandidato | null;
  habilidades: Categoria[];
}

export interface EmpleadorProfileView {
  usuario: UsuarioPublico;
  perfil: PerfilEmpleador | null;
}

export async function getCandidato(userId: number): Promise<CandidatoProfileView> {
  const usuario = await usersRepo.findById(userId);
  if (!usuario) throw notFound('Usuario no encontrado');
  const perfil = await repo.getCandidato(userId);
  const habilidades = await repo.getCandidatoHabilidades(userId);
  return { usuario, perfil, habilidades };
}

export async function upsertCandidato(
  userId: number,
  input: CandidatoProfileInput,
): Promise<CandidatoProfileView> {
  const { habilidades, url_cv, ...rest } = input;
  await repo.upsertCandidato(userId, { ...rest, url_cv: url_cv || null });
  if (habilidades) {
    await repo.setCandidatoHabilidades(userId, habilidades);
  }
  return getCandidato(userId);
}

export async function getEmpleador(userId: number): Promise<EmpleadorProfileView> {
  const usuario = await usersRepo.findById(userId);
  if (!usuario) throw notFound('Usuario no encontrado');
  const perfil = await repo.getEmpleador(userId);
  return { usuario, perfil };
}

export async function upsertEmpleador(
  userId: number,
  input: EmpleadorProfileInput,
): Promise<EmpleadorProfileView> {
  await repo.upsertEmpleador(userId, {
    ...input,
    sitio_web: input.sitio_web || null,
    logo_url: input.logo_url || null,
  });
  return getEmpleador(userId);
}

export function listHabilidades(): Promise<Categoria[]> {
  return repo.listHabilidades();
}
