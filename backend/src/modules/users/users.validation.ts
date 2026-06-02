import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateUserSchema = z
  .object({
    nombre: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().toLowerCase().email().max(160).optional(),
    contrasena: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(72)
      .regex(/[A-Za-z]/, 'Debe incluir al menos una letra')
      .regex(/\d/, 'Debe incluir al menos un número')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export const updateRoleSchema = z.object({
  rol: z.enum(['candidato', 'empleador', 'admin']),
});

export const updateStatusSchema = z.object({
  activo: z.boolean(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  rol: z.enum(['candidato', 'empleador', 'admin']).optional(),
  activo: z.enum(['true', 'false']).optional(),
  q: z.string().trim().max(120).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
