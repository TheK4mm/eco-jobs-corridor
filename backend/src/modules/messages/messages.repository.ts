import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';

export interface Mensaje extends RowDataPacket {
  id_mensaje: number;
  id_postulacion: number;
  id_remitente: number;
  remitente: string;
  cuerpo: string;
  leido: number;
  fecha_envio: Date | string;
}

export async function create(
  id_postulacion: number,
  id_remitente: number,
  cuerpo: string,
): Promise<number> {
  const result = await execute(
    'INSERT INTO mensajes (id_postulacion, id_remitente, cuerpo) VALUES (?, ?, ?)',
    [id_postulacion, id_remitente, cuerpo],
  );
  return result.insertId;
}

export async function listByPostulacion(id_postulacion: number): Promise<Mensaje[]> {
  return query<Mensaje[]>(
    `SELECT m.id_mensaje, m.id_postulacion, m.id_remitente, u.nombre AS remitente,
            m.cuerpo, m.leido, m.fecha_envio
       FROM mensajes m
       JOIN usuarios u ON m.id_remitente = u.id_usuario
      WHERE m.id_postulacion = ?
      ORDER BY m.fecha_envio ASC`,
    [id_postulacion],
  );
}

/** Marca como leídos los mensajes de la conversación que NO envió el lector. */
export async function markReadFor(id_postulacion: number, readerId: number): Promise<void> {
  await execute(
    'UPDATE mensajes SET leido = 1 WHERE id_postulacion = ? AND id_remitente <> ? AND leido = 0',
    [id_postulacion, readerId],
  );
}
