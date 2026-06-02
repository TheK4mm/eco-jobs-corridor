import * as repo from './applications.repository';
import * as jobsRepo from '../jobs/jobs.repository';
import * as notificationsRepo from '../notifications/notifications.repository';
import { withTransaction } from '../../config/db';
import { badRequest, conflict, forbidden, notFound } from '../../utils/AppError';
import { buildPaginated } from '../../utils/pagination';
import type { AuthPayload, Paginated, PaginationParams } from '../../types/common';
import type { EstadoPostulacion, Postulacion } from '../../types/models';

const ESTADO_LABEL: Record<EstadoPostulacion, string> = {
  enviada: 'Enviada',
  en_revision: 'En revisión',
  preseleccionado: 'Preseleccionado',
  rechazado: 'Rechazada',
  aceptado: 'Aceptada',
};

export async function apply(
  candidato: AuthPayload,
  ofertaId: number,
  mensaje?: string,
): Promise<Postulacion> {
  const oferta = await jobsRepo.findById(ofertaId);
  if (!oferta) throw notFound('Oferta no encontrada');
  if (oferta.estado !== 'activa') throw badRequest('La oferta no está disponible para postulaciones');
  if (oferta.id_empleador === candidato.id_usuario) {
    throw badRequest('No puedes postularte a tu propia oferta');
  }
  if (await repo.existsForCandidateAndJob(candidato.id_usuario, ofertaId)) {
    throw conflict('Ya te has postulado a esta oferta');
  }

  // Postulación + notificación al empleador, de forma atómica.
  const id = await withTransaction(async (conn) => {
    const newId = await repo.create(
      { id_oferta: ofertaId, id_candidato: candidato.id_usuario, mensaje: mensaje ?? null },
      conn,
    );
    await notificationsRepo.create(
      {
        id_usuario: oferta.id_empleador,
        tipo: 'postulacion',
        titulo: 'Nueva postulación recibida',
        mensaje: `${candidato.email} se postuló a "${oferta.titulo}"`,
        enlace: `/empleador/ofertas/${ofertaId}/postulaciones`,
      },
      conn,
    );
    return newId;
  });

  return (await repo.findById(id)) as Postulacion;
}

export async function listMine(
  candidatoId: number,
  pagination: PaginationParams,
): Promise<Paginated<Postulacion>> {
  const { rows, total } = await repo.listByCandidate(candidatoId, pagination);
  return buildPaginated(rows, total, pagination);
}

export async function listByJob(
  requester: AuthPayload,
  ofertaId: number,
  pagination: PaginationParams,
): Promise<Paginated<Postulacion>> {
  const ownerId = await jobsRepo.findOwnerId(ofertaId);
  if (ownerId === null) throw notFound('Oferta no encontrada');
  if (requester.rol !== 'admin' && ownerId !== requester.id_usuario) {
    throw forbidden('No eres el propietario de esta oferta');
  }
  const { rows, total } = await repo.listByJob(ofertaId, pagination);
  return buildPaginated(rows, total, pagination);
}

export async function getById(requester: AuthPayload, id: number): Promise<Postulacion> {
  const post = await repo.findById(id);
  if (!post) throw notFound('Postulación no encontrada');

  const isCandidate = post.id_candidato === requester.id_usuario;
  const isJobOwner = post.id_empleador === requester.id_usuario;
  if (requester.rol !== 'admin' && !isCandidate && !isJobOwner) {
    throw forbidden('No tienes acceso a esta postulación');
  }
  return post;
}

export async function updateStatus(
  requester: AuthPayload,
  id: number,
  estado: EstadoPostulacion,
): Promise<Postulacion> {
  const post = await repo.findById(id);
  if (!post) throw notFound('Postulación no encontrada');
  if (requester.rol !== 'admin' && post.id_empleador !== requester.id_usuario) {
    throw forbidden('Solo el empleador dueño de la oferta puede cambiar el estado');
  }

  await withTransaction(async (conn) => {
    await repo.updateEstado(id, estado, conn);
    await notificationsRepo.create(
      {
        id_usuario: post.id_candidato,
        tipo: 'estado_postulacion',
        titulo: 'Actualización de tu postulación',
        mensaje: `Tu postulación a "${post.titulo}" cambió a: ${ESTADO_LABEL[estado]}`,
        enlace: '/candidato/postulaciones',
      },
      conn,
    );
  });

  return (await repo.findById(id)) as Postulacion;
}

export async function remove(requester: AuthPayload, id: number): Promise<void> {
  const post = await repo.findById(id);
  if (!post) throw notFound('Postulación no encontrada');
  if (requester.rol !== 'admin' && post.id_candidato !== requester.id_usuario) {
    throw forbidden('Solo puedes retirar tus propias postulaciones');
  }
  await repo.remove(id);
}
