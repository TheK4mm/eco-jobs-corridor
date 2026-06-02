import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as service from './applications.service';

export const apply = asyncHandler(async (req: Request, res: Response) => {
  const postulacion = await service.apply(req.user!, req.body.id_oferta, req.body.mensaje);
  res.status(201).json({ message: 'Postulación enviada con éxito', postulacion });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listMine(req.user!.id_usuario, parsePagination(req.query)));
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.getById(req.user!, Number(req.params.id)));
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const postulacion = await service.updateStatus(req.user!, Number(req.params.id), req.body.estado);
  res.json({ message: 'Estado de la postulación actualizado', postulacion });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.user!, Number(req.params.id));
  res.json({ message: 'Postulación retirada correctamente' });
});

/** Usado por la ruta GET /jobs/:id/applications (postulantes de una oferta). */
export const listByJob = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listByJob(req.user!, Number(req.params.id), parsePagination(req.query)));
});
