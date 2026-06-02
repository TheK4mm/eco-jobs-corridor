import { api } from './client';
import type { Notificacion, Paginated } from '@/types';

export const listNotifications = (params: {
  page?: number;
  limit?: number;
}): Promise<Paginated<Notificacion>> =>
  api.get<Paginated<Notificacion>>('/notificaciones', { params }).then((r) => r.data);

export const getUnreadCount = (): Promise<{ count: number }> =>
  api.get<{ count: number }>('/notificaciones/unread-count').then((r) => r.data);

export const markNotificationRead = (id: number): Promise<{ message: string }> =>
  api.patch(`/notificaciones/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = (): Promise<{ message: string; updated: number }> =>
  api.patch('/notificaciones/read-all').then((r) => r.data);
