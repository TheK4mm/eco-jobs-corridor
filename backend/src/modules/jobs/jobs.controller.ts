import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as jobsService from './jobs.service';
import * as audit from '../audit/audit.service';
import type { JobFilters } from './jobs.repository';

type PublicFilters = Omit<JobFilters, 'estado' | 'id_empleador'>;

function parseFilters(query: Request['query']): PublicFilters {
  return {
    q: typeof query.q === 'string' ? query.q : undefined,
    id_categoria: query.id_categoria ? Number(query.id_categoria) : undefined,
    ubicacion: typeof query.ubicacion === 'string' ? query.ubicacion : undefined,
    modalidad: query.modalidad as JobFilters['modalidad'],
    tipo_contrato: query.tipo_contrato as JobFilters['tipo_contrato'],
    salario_min: query.salario_min ? Number(query.salario_min) : undefined,
  };
}

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  res.json(await jobsService.listPublic(parsePagination(req.query), parseFilters(req.query)));
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  res.json(await jobsService.listMine(req.user!.id_usuario, parsePagination(req.query)));
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  res.json(await jobsService.getById(Number(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const oferta = await jobsService.create(req.user!, req.body);
  res.status(201).json({ message: 'Oferta creada exitosamente', oferta });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const oferta = await jobsService.update(req.user!, Number(req.params.id), req.body);
  res.json({ message: 'Oferta actualizada con éxito', oferta });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await jobsService.remove(req.user!, id);
  await audit.registrar({
    id_actor: req.user!.id_usuario,
    accion: 'oferta.eliminada',
    entidad: 'oferta',
    id_entidad: id,
    ip: req.ip,
  });
  res.json({ message: 'Oferta eliminada correctamente' });
});
