import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as service from './notifications.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.list(req.user!.id_usuario, parsePagination(req.query)));
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  res.json({ count: await service.unreadCount(req.user!.id_usuario) });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await service.markRead(Number(req.params.id), req.user!.id_usuario);
  res.json({ message: 'Notificación marcada como leída' });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const updated = await service.markAllRead(req.user!.id_usuario);
  res.json({ message: 'Todas las notificaciones marcadas como leídas', updated });
});
