import { z } from 'zod';
import { MODALIDADES } from '../../constants/enums';

export const createAlertSchema = z
  .object({
    palabra_clave: z.string().trim().max(120).optional(),
    id_categoria: z.coerce.number().int().positive().optional(),
    modalidad: z.enum(MODALIDADES).optional(),
  })
  .refine((d) => Boolean(d.palabra_clave || d.id_categoria || d.modalidad), {
    message: 'Define al menos un criterio: palabra clave, categoría o modalidad',
  });

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
