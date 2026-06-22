import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as service from './applications.service';
import * as audit from '../audit/audit.service';

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
  const id = Number(req.params.id);
  const postulacion = await service.updateStatus(req.user!, id, req.body.estado);
  await audit.registrar({
    id_actor: req.user!.id_usuario,
    accion: 'postulacion.cambio_estado',
    entidad: 'postulacion',
    id_entidad: id,
    detalle: { estado: req.body.estado },
    ip: req.ip,
  });
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
