import { z } from 'zod';
import { ROLES_REGISTRO } from '../../constants/enums';

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  email: z.string().trim().toLowerCase().email('Correo electrónico inválido').max(160),
  contrasena: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres')
    .regex(/[A-Za-z]/, 'Debe incluir al menos una letra')
    .regex(/\d/, 'Debe incluir al menos un número'),
  // Importante: el rol 'admin' NO se acepta por registro público (evita escalada de privilegios).
  rol: z.enum(ROLES_REGISTRO).default('candidato'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo electrónico inválido'),
  contrasena: z.string().min(1, 'La contraseña es obligatoria'),
});

/** Contraseña con las mismas reglas de robustez que en el registro. */
const contrasenaFuerte = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede superar 72 caracteres')
  .regex(/[A-Za-z]/, 'Debe incluir al menos una letra')
  .regex(/\d/, 'Debe incluir al menos un número');

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es obligatorio'),
});

export const logoutSchema = refreshSchema;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo electrónico inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es obligatorio'),
  contrasena: contrasenaFuerte,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
