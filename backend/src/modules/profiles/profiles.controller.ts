import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as service from './profiles.service';

export const getMyCandidato = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.getCandidato(req.user!.id_usuario));
});

export const upsertMyCandidato = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.upsertCandidato(req.user!.id_usuario, req.body);
  res.json({ message: 'Perfil de candidato actualizado', ...data });
});

export const getCandidatoByUserId = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.getCandidato(Number(req.params.userId)));
});

export const getMyEmpleador = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.getEmpleador(req.user!.id_usuario));
});

export const upsertMyEmpleador = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.upsertEmpleador(req.user!.id_usuario, req.body);
  res.json({ message: 'Perfil de empleador actualizado', ...data });
});

export const getEmpleadorByUserId = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.getEmpleador(Number(req.params.userId)));
});

export const listHabilidades = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await service.listHabilidades());
});
