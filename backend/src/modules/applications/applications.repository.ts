import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { execute, pool, query } from '../../config/db';
import { getOffset } from '../../utils/pagination';
import type { PaginationParams } from '../../types/common';
import type { EstadoPostulacion, Postulacion } from '../../types/models';

type Executor = Pool | PoolConnection;

export interface PostulacionDetalle extends Postulacion {
  id_empleador: number;
}

export async function existsForCandidateAndJob(
  candidatoId: number,
  ofertaId: number,
): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    'SELECT id_postulacion FROM postulaciones WHERE id_candidato = ? AND id_oferta = ?',
    [candidatoId, ofertaId],
  );
  return rows.length > 0;
}

export async function create(
  input: { id_oferta: number; id_candidato: number; mensaje: string | null },
  executor: Executor = pool,
): Promise<number> {
  const [result] = await executor.query<ResultSetHeader>(
    'INSERT INTO postulaciones (id_oferta, id_candidato, mensaje) VALUES (?, ?, ?)',
    [input.id_oferta, input.id_candidato, input.mensaje],
  );
  return result.insertId;
}

const SELECT_FOR_CANDIDATE = `
  SELECT p.id_postulacion, p.id_oferta, p.id_candidato, p.estado, p.mensaje,
         p.fecha_postulacion, p.fecha_actualizacion,
         o.titulo, o.empresa, o.ubicacion
  FROM postulaciones p
  JOIN ofertas o ON p.id_oferta = o.id_oferta`;

export async function listByCandidate(
  candidatoId: number,
  pagination: PaginationParams,
): Promise<{ rows: Postulacion[]; total: number }> {
  const countRows = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM postulaciones WHERE id_candidato = ?',
    [candidatoId],
  );
  const rows = await query<RowDataPacket[]>(
    `${SELECT_FOR_CANDIDATE} WHERE p.id_candidato = ?
     ORDER BY p.fecha_postulacion DESC LIMIT ? OFFSET ?`,
    [candidatoId, pagination.limit, getOffset(pagination)],
  );
  return { rows: rows as Postulacion[], total: Number(countRows[0].total) };
}

const SELECT_FOR_JOB = `
  SELECT p.id_postulacion, p.id_oferta, p.id_candidato, p.estado, p.mensaje,
         p.fecha_postulacion, p.fecha_actualizacion,
         u.nombre AS candidato, u.email AS candidato_email
  FROM postulaciones p
  JOIN usuarios u ON p.id_candidato = u.id_usuario`;

export async function listByJob(
  ofertaId: number,
  pagination: PaginationParams,
): Promise<{ rows: Postulacion[]; total: number }> {
  const countRows = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM postulaciones WHERE id_oferta = ?',
    [ofertaId],
  );
  const rows = await query<RowDataPacket[]>(
    `${SELECT_FOR_JOB} WHERE p.id_oferta = ?
     ORDER BY p.fecha_postulacion DESC LIMIT ? OFFSET ?`,
    [ofertaId, pagination.limit, getOffset(pagination)],
  );
  return { rows: rows as Postulacion[], total: Number(countRows[0].total) };
}

export async function findById(id: number): Promise<PostulacionDetalle | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT p.*, o.titulo, o.empresa, o.ubicacion, o.id_empleador,
            u.nombre AS candidato, u.email AS candidato_email
     FROM postulaciones p
     JOIN ofertas o ON p.id_oferta = o.id_oferta
     JOIN usuarios u ON p.id_candidato = u.id_usuario
     WHERE p.id_postulacion = ?`,
    [id],
  );
  return (rows[0] as PostulacionDetalle) ?? null;
}

export async function updateEstado(
  id: number,
  estado: EstadoPostulacion,
  executor: Executor = pool,
): Promise<number> {
  const [result] = await executor.query<ResultSetHeader>(
    'UPDATE postulaciones SET estado = ? WHERE id_postulacion = ?',
    [estado, id],
  );
  return result.affectedRows;
}

export async function remove(id: number): Promise<number> {
  const result = await execute('DELETE FROM postulaciones WHERE id_postulacion = ?', [id]);
  return result.affectedRows;
}
