import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as service from './messages.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await service.listConversation(req.user!, Number(req.params.id)));
});

export const send = asyncHandler(async (req: Request, res: Response) => {
  const mensajes = await service.send(req.user!, Number(req.params.id), req.body.cuerpo);
  res.status(201).json({ message: 'Mensaje enviado', mensajes });
});
