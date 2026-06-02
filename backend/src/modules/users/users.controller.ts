import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as usersService from './users.service';
import type { Rol } from '../../types/common';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query);
  const filters = {
    rol: req.query.rol as Rol | undefined,
    q: typeof req.query.q === 'string' ? req.query.q : undefined,
    activo: req.query.activo === undefined ? undefined : req.query.activo === 'true',
  };
  res.json(await usersService.list(pagination, filters));
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await usersService.getById(req.user!, Number(req.params.id)));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.update(req.user!, Number(req.params.id), req.body);
  res.json({ message: 'Usuario actualizado correctamente', user });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateRole(Number(req.params.id), req.body.rol);
  res.json({ message: 'Rol actualizado correctamente', user });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateStatus(Number(req.params.id), req.body.activo);
  res.json({ message: 'Estado actualizado correctamente', user });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await usersService.remove(req.user!, Number(req.params.id));
  res.json({ message: 'Usuario eliminado correctamente' });
});
