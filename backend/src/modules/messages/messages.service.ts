import * as repo from './messages.repository';
import * as applicationsService from '../applications/applications.service';
import * as notificationsRepo from '../notifications/notifications.repository';
import type { Mensaje } from './messages.repository';
import type { AuthPayload } from '../../types/common';

export interface Conversacion {
  postulacion: {
    id_postulacion: number;
    titulo?: string;
    empresa?: string | null;
    candidato?: string;
    estado: string;
  };
  mensajes: Mensaje[];
}

/**
 * Lista la conversación de una postulación. Reutiliza la autorización de
 * `applications.getById` (candidato dueño, empleador de la oferta o admin) y
 * marca como leídos los mensajes entrantes.
 */
export async function listConversation(
  requester: AuthPayload,
  idPostulacion: number,
): Promise<Conversacion> {
  const post = await applicationsService.getById(requester, idPostulacion);
  await repo.markReadFor(idPostulacion, requester.id_usuario);
  const mensajes = await repo.listByPostulacion(idPostulacion);
  return {
    postulacion: {
      id_postulacion: post.id_postulacion,
      titulo: post.titulo,
      empresa: post.empresa,
      candidato: post.candidato,
      estado: post.estado,
    },
    mensajes,
  };
}

export async function send(
  requester: AuthPayload,
  idPostulacion: number,
  cuerpo: string,
): Promise<Mensaje[]> {
  const post = await applicationsService.getById(requester, idPostulacion);
  await repo.create(idPostulacion, requester.id_usuario, cuerpo);

  // Notifica al otro participante de la conversación.
  const recipientId =
    requester.id_usuario === post.id_candidato ? post.id_empleador : post.id_candidato;
  await notificationsRepo.create({
    id_usuario: recipientId,
    tipo: 'mensaje',
    titulo: 'Nuevo mensaje',
    mensaje: `Tienes un nuevo mensaje sobre "${post.titulo ?? 'tu postulación'}"`,
    enlace: `/mensajes/${idPostulacion}`,
  });

  return repo.listByPostulacion(idPostulacion);
}
