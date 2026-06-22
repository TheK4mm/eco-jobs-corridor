import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as service from './saved-jobs.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listSaved(req.user!.id_usuario, parsePagination(req.query)));
});

export const ids = asyncHandler(async (req: Request, res: Response) => {
  res.json({ ids: await service.listSavedIds(req.user!.id_usuario) });
});

export const save = asyncHandler(async (req: Request, res: Response) => {
  await service.save(req.user!.id_usuario, Number(req.params.id));
  res.status(201).json({ message: 'Oferta guardada' });
});

export const unsave = asyncHandler(async (req: Request, res: Response) => {
  await service.unsave(req.user!.id_usuario, Number(req.params.id));
  res.json({ message: 'Oferta quitada de guardados' });
});
