import * as alertsRepo from './alerts.repository';
import * as notificationsRepo from '../notifications/notifications.repository';
import * as mailer from '../email/email.service';
import { logger } from '../../config/logger';
import { notFound } from '../../utils/AppError';
import type { CreateAlertInput } from './alerts.validation';
import type { Alerta } from './alerts.repository';
import type { Oferta } from '../../types/models';

export function listMine(id_usuario: number): Promise<Alerta[]> {
  return alertsRepo.listByUser(id_usuario);
}

export async function create(id_usuario: number, input: CreateAlertInput): Promise<Alerta[]> {
  await alertsRepo.create(id_usuario, input);
  return alertsRepo.listByUser(id_usuario);
}

export async function remove(id_alerta: number, id_usuario: number): Promise<void> {
  const affected = await alertsRepo.remove(id_alerta, id_usuario);
  if (!affected) throw notFound('Alerta no encontrada');
}

/**
 * Notifica (in-app + email) a los candidatos cuyas alertas coinciden con una
 * oferta recién publicada. Best-effort: cualquier fallo se registra sin romper
 * la publicación de la oferta.
 */
export async function notifyMatching(oferta: Oferta): Promise<void> {
  try {
    const destinatarios = await alertsRepo.findMatching(oferta);
    await Promise.all(
      destinatarios.map(async (dest) => {
        await notificationsRepo.create({
          id_usuario: dest.id_usuario,
          tipo: 'alerta_empleo',
          titulo: 'Nueva oferta para ti',
          mensaje: `Se publicó "${oferta.titulo}" que coincide con una de tus alertas`,
          enlace: `/ofertas/${oferta.id_oferta}`,
        });
        void mailer.sendJobAlert(dest.email, dest.nombre, oferta.titulo, oferta.id_oferta);
      }),
    );
  } catch (error) {
    logger.error(
      { err: error, id_oferta: oferta.id_oferta },
      'Fallo al notificar alertas de empleo',
    );
  }
}
