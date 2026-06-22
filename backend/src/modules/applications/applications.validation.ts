import { z } from 'zod';
import { ESTADOS_POSTULACION } from '../../constants/enums';

export const createApplicationSchema = z.object({
  id_oferta: z.coerce.number().int().positive(),
  mensaje: z.string().trim().max(1000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  estado: z.enum(ESTADOS_POSTULACION),
});

export const listApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
