import * as repo from './notifications.repository';
import { buildPaginated } from '../../utils/pagination';
import { notFound } from '../../utils/AppError';
import type { Notificacion } from '../../types/models';
import type { Paginated, PaginationParams } from '../../types/common';

export async function list(
  userId: number,
  pagination: PaginationParams,
): Promise<Paginated<Notificacion>> {
  const { rows, total } = await repo.listByUser(userId, pagination);
  return buildPaginated(rows, total, pagination);
}

export function unreadCount(userId: number): Promise<number> {
  return repo.unreadCount(userId);
}

export async function markRead(id: number, userId: number): Promise<void> {
  const affected = await repo.markRead(id, userId);
  if (!affected) throw notFound('Notificación no encontrada');
}

export async function markAllRead(userId: number): Promise<number> {
  return repo.markAllRead(userId);
}
