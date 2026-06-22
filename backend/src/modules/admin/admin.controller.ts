import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import * as adminService from './admin.service';
import * as jobsService from '../jobs/jobs.service';
import * as audit from '../audit/audit.service';
import type { JobFilters } from '../jobs/jobs.repository';

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await adminService.getStats());
});

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const filters: JobFilters = {
    q: typeof req.query.q === 'string' ? req.query.q : undefined,
    estado: req.query.estado as JobFilters['estado'],
    id_categoria: req.query.id_categoria ? Number(req.query.id_categoria) : undefined,
    ubicacion: typeof req.query.ubicacion === 'string' ? req.query.ubicacion : undefined,
    modalidad: req.query.modalidad as JobFilters['modalidad'],
    tipo_contrato: req.query.tipo_contrato as JobFilters['tipo_contrato'],
  };
  res.json(await jobsService.listAll(parsePagination(req.query), filters));
});

export const listAudit = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    entidad: typeof req.query.entidad === 'string' ? req.query.entidad : undefined,
    accion: typeof req.query.accion === 'string' ? req.query.accion : undefined,
  };
  res.json(await audit.listar(parsePagination(req.query), filters));
});
