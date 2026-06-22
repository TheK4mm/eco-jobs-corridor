import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';
import { getOffset } from '../../utils/pagination';
import type { PaginationParams } from '../../types/common';

export interface AuditInput {
  id_actor?: number | null;
  accion: string;
  entidad: string;
  id_entidad?: number | null;
  detalle?: unknown;
  ip?: string | null;
}

export interface AuditRow extends RowDataPacket {
  id_evento: number;
  id_actor: number | null;
  actor: string | null;
  accion: string;
  entidad: string;
  id_entidad: number | null;
  detalle: unknown;
  ip: string | null;
  fecha: Date | string;
}

export async function insert(entry: AuditInput): Promise<void> {
  await execute(
    `INSERT INTO auditoria (id_actor, accion, entidad, id_entidad, detalle, ip)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entry.id_actor ?? null,
      entry.accion,
      entry.entidad,
      entry.id_entidad ?? null,
      entry.detalle === undefined ? null : JSON.stringify(entry.detalle),
      entry.ip ?? null,
    ],
  );
}

export async function list(
  pagination: PaginationParams,
  filters: { entidad?: string; accion?: string } = {},
): Promise<{ rows: AuditRow[]; total: number }> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters.entidad) {
    where.push('a.entidad = ?');
    params.push(filters.entidad);
  }
  if (filters.accion) {
    where.push('a.accion = ?');
    params.push(filters.accion);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM auditoria a ${whereSql}`,
    params,
  );
  const total = Number(countRows[0].total);

  const rows = await query<AuditRow[]>(
    `SELECT a.id_evento, a.id_actor, u.nombre AS actor, a.accion, a.entidad,
            a.id_entidad, a.detalle, a.ip, a.fecha
     FROM auditoria a
     LEFT JOIN usuarios u ON a.id_actor = u.id_usuario
     ${whereSql}
     ORDER BY a.fecha DESC, a.id_evento DESC
     LIMIT ? OFFSET ?`,
    [...params, pagination.limit, getOffset(pagination)],
  );

  return { rows, total };
}
