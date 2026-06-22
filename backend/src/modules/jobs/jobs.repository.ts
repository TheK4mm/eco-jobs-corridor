import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';
import { getOffset } from '../../utils/pagination';
import type { PaginationParams } from '../../types/common';
import type { EstadoOferta, Modalidad, Oferta, TipoContrato } from '../../types/models';

const SELECT_BASE = `
  SELECT o.*, u.nombre AS empleador, c.nombre AS categoria
  FROM ofertas o
  JOIN usuarios u ON o.id_empleador = u.id_usuario
  LEFT JOIN categorias c ON o.id_categoria = c.id_categoria`;

export interface JobFilters {
  q?: string;
  id_categoria?: number;
  ubicacion?: string;
  modalidad?: Modalidad;
  tipo_contrato?: TipoContrato;
  salario_min?: number;
  estado?: EstadoOferta;
  id_empleador?: number;
}

function buildWhere(filters: JobFilters): { sql: string; params: unknown[] } {
  // Las ofertas con borrado lógico nunca se listan.
  const where: string[] = ['o.deleted_at IS NULL'];
  const params: unknown[] = [];

  if (filters.q) {
    where.push('(o.titulo LIKE ? OR o.descripcion LIKE ? OR o.empresa LIKE ?)');
    const like = `%${filters.q}%`;
    params.push(like, like, like);
  }
  if (filters.id_categoria) {
    where.push('o.id_categoria = ?');
    params.push(filters.id_categoria);
  }
  if (filters.ubicacion) {
    where.push('o.ubicacion LIKE ?');
    params.push(`%${filters.ubicacion}%`);
  }
  if (filters.modalidad) {
    where.push('o.modalidad = ?');
    params.push(filters.modalidad);
  }
  if (filters.tipo_contrato) {
    where.push('o.tipo_contrato = ?');
    params.push(filters.tipo_contrato);
  }
  if (filters.salario_min !== undefined) {
    where.push('(o.salario_max IS NULL OR o.salario_max >= ?)');
    params.push(filters.salario_min);
  }
  if (filters.estado) {
    where.push('o.estado = ?');
    params.push(filters.estado);
  }
  if (filters.id_empleador) {
    where.push('o.id_empleador = ?');
    params.push(filters.id_empleador);
  }

  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

export async function list(
  pagination: PaginationParams,
  filters: JobFilters = {},
): Promise<{ rows: Oferta[]; total: number }> {
  const { sql: whereSql, params } = buildWhere(filters);

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM ofertas o ${whereSql}`,
    params,
  );
  const total = Number(countRows[0].total);

  const rows = await query<RowDataPacket[]>(
    `${SELECT_BASE} ${whereSql} ORDER BY o.fecha_publicacion DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, getOffset(pagination)],
  );

  return { rows: rows as Oferta[], total };
}

export async function findById(id: number): Promise<Oferta | null> {
  const rows = await query<RowDataPacket[]>(
    `${SELECT_BASE} WHERE o.id_oferta = ? AND o.deleted_at IS NULL`,
    [id],
  );
  return (rows[0] as Oferta) ?? null;
}

/** Devuelve solo el id del empleador dueño (para verificación de permisos). */
export async function findOwnerId(id: number): Promise<number | null> {
  const rows = await query<RowDataPacket[]>(
    'SELECT id_empleador FROM ofertas WHERE id_oferta = ? AND deleted_at IS NULL',
    [id],
  );
  return rows.length ? Number(rows[0].id_empleador) : null;
}

export interface CreateJobInput {
  id_empleador: number;
  id_categoria: number | null;
  titulo: string;
  descripcion: string;
  empresa: string | null;
  ubicacion: string;
  modalidad: Modalidad;
  tipo_contrato: TipoContrato;
  salario_min: number | null;
  salario_max: number | null;
  estado: EstadoOferta;
  fecha_cierre: string | null;
}

export async function create(input: CreateJobInput): Promise<number> {
  const result = await execute(
    `INSERT INTO ofertas
       (id_empleador, id_categoria, titulo, descripcion, empresa, ubicacion,
        modalidad, tipo_contrato, salario_min, salario_max, estado, fecha_cierre)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id_empleador,
      input.id_categoria,
      input.titulo,
      input.descripcion,
      input.empresa,
      input.ubicacion,
      input.modalidad,
      input.tipo_contrato,
      input.salario_min,
      input.salario_max,
      input.estado,
      input.fecha_cierre,
    ],
  );
  return result.insertId;
}

export interface UpdateJobFields {
  id_categoria?: number | null;
  titulo?: string;
  descripcion?: string;
  empresa?: string | null;
  ubicacion?: string;
  modalidad?: Modalidad;
  tipo_contrato?: TipoContrato;
  salario_min?: number | null;
  salario_max?: number | null;
  estado?: EstadoOferta;
  fecha_cierre?: string | null;
}

export async function update(id: number, fields: UpdateJobFields): Promise<number> {
  const sets: string[] = [];
  const params: unknown[] = [];
  const push = (column: string, value: unknown): void => {
    sets.push(`${column} = ?`);
    params.push(value);
  };

  if (fields.id_categoria !== undefined) push('id_categoria', fields.id_categoria);
  if (fields.titulo !== undefined) push('titulo', fields.titulo);
  if (fields.descripcion !== undefined) push('descripcion', fields.descripcion);
  if (fields.empresa !== undefined) push('empresa', fields.empresa);
  if (fields.ubicacion !== undefined) push('ubicacion', fields.ubicacion);
  if (fields.modalidad !== undefined) push('modalidad', fields.modalidad);
  if (fields.tipo_contrato !== undefined) push('tipo_contrato', fields.tipo_contrato);
  if (fields.salario_min !== undefined) push('salario_min', fields.salario_min);
  if (fields.salario_max !== undefined) push('salario_max', fields.salario_max);
  if (fields.estado !== undefined) push('estado', fields.estado);
  if (fields.fecha_cierre !== undefined) push('fecha_cierre', fields.fecha_cierre);

  if (sets.length === 0) return 0;
  params.push(id);
  const result = await execute(`UPDATE ofertas SET ${sets.join(', ')} WHERE id_oferta = ?`, params);
  return result.affectedRows;
}

/**
 * Borrado LÓGICO: conserva la oferta y sus postulaciones (histórico para
 * candidatos y auditoría), pero deja de listarse y de ser accesible.
 */
export async function remove(id: number): Promise<number> {
  const result = await execute(
    'UPDATE ofertas SET deleted_at = CURRENT_TIMESTAMP WHERE id_oferta = ? AND deleted_at IS NULL',
    [id],
  );
  return result.affectedRows;
}
