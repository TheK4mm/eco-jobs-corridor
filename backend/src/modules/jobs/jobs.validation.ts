import { z } from 'zod';
import { MODALIDADES, TIPOS_CONTRATO, ESTADOS_OFERTA } from '../../constants/enums';

const modalidad = z.enum(MODALIDADES);
const tipoContrato = z.enum(TIPOS_CONTRATO);
const estado = z.enum(ESTADOS_OFERTA);
const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato YYYY-MM-DD');

export const createJobSchema = z
  .object({
    titulo: z.string().trim().min(4, 'El título es muy corto').max(160),
    descripcion: z.string().trim().min(10, 'La descripción es muy corta').max(5000),
    empresa: z.string().trim().max(150).optional(),
    ubicacion: z.string().trim().min(2).max(120).default('Corredor Ecológico'),
    id_categoria: z.coerce.number().int().positive().optional(),
    modalidad: modalidad.default('presencial'),
    tipo_contrato: tipoContrato.default('tiempo_completo'),
    salario_min: z.coerce.number().min(0).optional(),
    salario_max: z.coerce.number().min(0).optional(),
    estado: estado.default('activa'),
    fecha_cierre: fechaISO.optional(),
  })
  .refine(
    (data) =>
      data.salario_min == null || data.salario_max == null || data.salario_max >= data.salario_min,
    { message: 'El salario máximo debe ser mayor o igual al mínimo', path: ['salario_max'] },
  );

export const updateJobSchema = z
  .object({
    titulo: z.string().trim().min(4).max(160).optional(),
    descripcion: z.string().trim().min(10).max(5000).optional(),
    empresa: z.string().trim().max(150).nullable().optional(),
    ubicacion: z.string().trim().min(2).max(120).optional(),
    id_categoria: z.coerce.number().int().positive().nullable().optional(),
    modalidad: modalidad.optional(),
    tipo_contrato: tipoContrato.optional(),
    salario_min: z.coerce.number().min(0).nullable().optional(),
    salario_max: z.coerce.number().min(0).nullable().optional(),
    estado: estado.optional(),
    fecha_cierre: fechaISO.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export const listJobsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().max(120).optional(),
  id_categoria: z.coerce.number().int().positive().optional(),
  ubicacion: z.string().trim().max(120).optional(),
  modalidad: modalidad.optional(),
  tipo_contrato: tipoContrato.optional(),
  salario_min: z.coerce.number().min(0).optional(),
  estado: estado.optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
