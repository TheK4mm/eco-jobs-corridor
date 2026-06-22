import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as usersService from './users.service';
import * as audit from '../audit/audit.service';
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
  const id = Number(req.params.id);
  const user = await usersService.updateRole(id, req.body.rol);
  await audit.registrar({
    id_actor: req.user!.id_usuario,
    accion: 'usuario.cambio_rol',
    entidad: 'usuario',
    id_entidad: id,
    detalle: { rol: req.body.rol },
    ip: req.ip,
  });
  res.json({ message: 'Rol actualizado correctamente', user });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await usersService.updateStatus(id, req.body.activo);
  await audit.registrar({
    id_actor: req.user!.id_usuario,
    accion: 'usuario.cambio_estado',
    entidad: 'usuario',
    id_entidad: id,
    detalle: { activo: req.body.activo },
    ip: req.ip,
  });
  res.json({ message: 'Estado actualizado correctamente', user });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await usersService.remove(req.user!, id);
  await audit.registrar({
    id_actor: req.user!.id_usuario,
    accion: 'usuario.eliminado',
    entidad: 'usuario',
    id_entidad: id,
    ip: req.ip,
  });
  res.json({ message: 'Usuario eliminado correctamente' });
});
