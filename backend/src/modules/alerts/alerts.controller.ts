import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as service from './alerts.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listMine(req.user!.id_usuario));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const alertas = await service.create(req.user!.id_usuario, req.body);
  res.status(201).json({ message: 'Alerta creada', alertas });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(Number(req.params.id), req.user!.id_usuario);
  res.json({ message: 'Alerta eliminada' });
});
