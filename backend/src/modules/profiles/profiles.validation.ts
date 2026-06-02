import { z } from 'zod';

const nullableString = (max: number) => z.string().trim().max(max).nullish();

export const candidatoProfileSchema = z.object({
  telefono: nullableString(30),
  titulo_profesional: nullableString(150),
  resumen: nullableString(2000),
  ubicacion: nullableString(120),
  experiencia_anios: z.coerce.number().int().min(0).max(70).nullish(),
  url_cv: z.string().trim().url('Debe ser una URL válida').max(255).nullish().or(z.literal('')),
  habilidades: z.array(z.coerce.number().int().positive()).max(30).optional(),
});

export const empleadorProfileSchema = z.object({
  nombre_empresa: z.string().trim().min(2, 'El nombre de la empresa es obligatorio').max(150),
  sector: nullableString(100),
  descripcion: nullableString(2000),
  sitio_web: z.string().trim().url('Debe ser una URL válida').max(200).nullish().or(z.literal('')),
  ubicacion: nullableString(120),
  telefono: nullableString(30),
  logo_url: z.string().trim().url('Debe ser una URL válida').max(255).nullish().or(z.literal('')),
});

export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export type CandidatoProfileInput = z.infer<typeof candidatoProfileSchema>;
export type EmpleadorProfileInput = z.infer<typeof empleadorProfileSchema>;
