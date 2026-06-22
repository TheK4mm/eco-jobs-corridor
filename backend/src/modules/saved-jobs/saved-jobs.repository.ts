import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';
import { getOffset } from '../../utils/pagination';
import type { PaginationParams } from '../../types/common';
import type { Oferta } from '../../types/models';

/** Marca una oferta como guardada (idempotente: si ya existe no falla). */
export async function save(id_usuario: number, id_oferta: number): Promise<void> {
  await execute('INSERT IGNORE INTO empleos_guardados (id_usuario, id_oferta) VALUES (?, ?)', [
    id_usuario,
    id_oferta,
  ]);
}

export async function unsave(id_usuario: number, id_oferta: number): Promise<number> {
  const result = await execute(
    'DELETE FROM empleos_guardados WHERE id_usuario = ? AND id_oferta = ?',
    [id_usuario, id_oferta],
  );
  return result.affectedRows;
}

/** Ids de las ofertas guardadas por el usuario (para marcar estado en listados). */
export async function savedIds(id_usuario: number): Promise<number[]> {
  const rows = await query<RowDataPacket[]>(
    'SELECT id_oferta FROM empleos_guardados WHERE id_usuario = ?',
    [id_usuario],
  );
  return rows.map((r) => Number(r.id_oferta));
}

/** Lista las ofertas guardadas (solo las que siguen vigentes), paginadas. */
export async function listSaved(
  id_usuario: number,
  pagination: PaginationParams,
): Promise<{ rows: Oferta[]; total: number }> {
  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
       FROM empleos_guardados g
       JOIN ofertas o ON g.id_oferta = o.id_oferta AND o.deleted_at IS NULL
      WHERE g.id_usuario = ?`,
    [id_usuario],
  );
  const total = Number(countRows[0].total);

  const rows = await query<RowDataPacket[]>(
    `SELECT o.*, u.nombre AS empleador, c.nombre AS categoria, g.fecha_guardado
       FROM empleos_guardados g
       JOIN ofertas o ON g.id_oferta = o.id_oferta AND o.deleted_at IS NULL
       JOIN usuarios u ON o.id_empleador = u.id_usuario
       LEFT JOIN categorias c ON o.id_categoria = c.id_categoria
      WHERE g.id_usuario = ?
      ORDER BY g.fecha_guardado DESC
      LIMIT ? OFFSET ?`,
    [id_usuario, pagination.limit, getOffset(pagination)],
  );

  return { rows: rows as Oferta[], total };
}
