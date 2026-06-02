import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import * as service from './categories.service';

export const categoryBodySchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es muy corto').max(80),
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await service.list());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const categoria = await service.create(req.body.nombre);
  res.status(201).json({ message: 'Categoría creada', categoria });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const categoria = await service.update(Number(req.params.id), req.body.nombre);
  res.json({ message: 'Categoría actualizada', categoria });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(Number(req.params.id));
  res.json({ message: 'Categoría eliminada' });
});
