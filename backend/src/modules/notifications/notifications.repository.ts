import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { execute, pool, query } from '../../config/db';
import { getOffset } from '../../utils/pagination';
import type { PaginationParams } from '../../types/common';
import type { Notificacion } from '../../types/models';

type Executor = Pool | PoolConnection;

export interface CrearNotificacion {
  id_usuario: number;
  tipo?: string;
  titulo: string;
  mensaje: string;
  enlace?: string | null;
}

/** Acepta un conexión opcional para crear la notificación dentro de una transacción. */
export async function create(input: CrearNotificacion, executor: Executor = pool): Promise<number> {
  const [result] = await executor.query<ResultSetHeader>(
    `INSERT INTO notificaciones (id_usuario, tipo, titulo, mensaje, enlace)
     VALUES (?, ?, ?, ?, ?)`,
    [input.id_usuario, input.tipo ?? 'general', input.titulo, input.mensaje, input.enlace ?? null],
  );
  return result.insertId;
}

export async function listByUser(
  userId: number,
  pagination: PaginationParams,
): Promise<{ rows: Notificacion[]; total: number }> {
  const countRows = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM notificaciones WHERE id_usuario = ?',
    [userId],
  );
  const rows = await query<RowDataPacket[]>(
    `SELECT * FROM notificaciones
     WHERE id_usuario = ?
     ORDER BY fecha_creacion DESC
     LIMIT ? OFFSET ?`,
    [userId, pagination.limit, getOffset(pagination)],
  );
  return { rows: rows as Notificacion[], total: Number(countRows[0].total) };
}

export async function unreadCount(userId: number): Promise<number> {
  const rows = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS n FROM notificaciones WHERE id_usuario = ? AND leida = 0',
    [userId],
  );
  return Number(rows[0].n);
}

export async function markRead(id: number, userId: number): Promise<number> {
  const result = await execute(
    'UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ? AND id_usuario = ?',
    [id, userId],
  );
  return result.affectedRows;
}

export async function markAllRead(userId: number): Promise<number> {
  const result = await execute(
    'UPDATE notificaciones SET leida = 1 WHERE id_usuario = ? AND leida = 0',
    [userId],
  );
  return result.affectedRows;
}
