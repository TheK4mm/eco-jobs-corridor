import type { RowDataPacket } from 'mysql2';
import { execute, query, withTransaction } from '../../config/db';
import type { Categoria, PerfilCandidato, PerfilEmpleador } from '../../types/models';

// ── Candidato ──────────────────────────────────────────────────────────
export async function getCandidato(userId: number): Promise<PerfilCandidato | null> {
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM perfiles_candidato WHERE id_usuario = ?',
    [userId],
  );
  return (rows[0] as PerfilCandidato) ?? null;
}

export interface CandidatoInput {
  telefono?: string | null;
  titulo_profesional?: string | null;
  resumen?: string | null;
  ubicacion?: string | null;
  experiencia_anios?: number | null;
  url_cv?: string | null;
}

export async function upsertCandidato(userId: number, data: CandidatoInput): Promise<void> {
  await execute(
    `INSERT INTO perfiles_candidato
       (id_usuario, telefono, titulo_profesional, resumen, ubicacion, experiencia_anios, url_cv)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       telefono = VALUES(telefono),
       titulo_profesional = VALUES(titulo_profesional),
       resumen = VALUES(resumen),
       ubicacion = VALUES(ubicacion),
       experiencia_anios = VALUES(experiencia_anios),
       url_cv = VALUES(url_cv)`,
    [
      userId,
      data.telefono ?? null,
      data.titulo_profesional ?? null,
      data.resumen ?? null,
      data.ubicacion ?? null,
      data.experiencia_anios ?? null,
      data.url_cv ?? null,
    ],
  );
}

// ── Empleador ──────────────────────────────────────────────────────────
export async function getEmpleador(userId: number): Promise<PerfilEmpleador | null> {
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM perfiles_empleador WHERE id_usuario = ?',
    [userId],
  );
  return (rows[0] as PerfilEmpleador) ?? null;
}

export interface EmpleadorInput {
  nombre_empresa: string;
  sector?: string | null;
  descripcion?: string | null;
  sitio_web?: string | null;
  ubicacion?: string | null;
  telefono?: string | null;
  logo_url?: string | null;
}

export async function upsertEmpleador(userId: number, data: EmpleadorInput): Promise<void> {
  await execute(
    `INSERT INTO perfiles_empleador
       (id_usuario, nombre_empresa, sector, descripcion, sitio_web, ubicacion, telefono, logo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       nombre_empresa = VALUES(nombre_empresa),
       sector = VALUES(sector),
       descripcion = VALUES(descripcion),
       sitio_web = VALUES(sitio_web),
       ubicacion = VALUES(ubicacion),
       telefono = VALUES(telefono),
       logo_url = VALUES(logo_url)`,
    [
      userId,
      data.nombre_empresa,
      data.sector ?? null,
      data.descripcion ?? null,
      data.sitio_web ?? null,
      data.ubicacion ?? null,
      data.telefono ?? null,
      data.logo_url ?? null,
    ],
  );
}

// ── Habilidades ────────────────────────────────────────────────────────
export async function listHabilidades(): Promise<Categoria[]> {
  const rows = await query<RowDataPacket[]>(
    'SELECT id_habilidad AS id_categoria, nombre FROM habilidades ORDER BY nombre',
  );
  return rows as Categoria[];
}

export async function getCandidatoHabilidades(userId: number): Promise<Categoria[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT h.id_habilidad AS id_categoria, h.nombre
     FROM candidato_habilidades ch
     JOIN habilidades h ON ch.id_habilidad = h.id_habilidad
     WHERE ch.id_usuario = ?
     ORDER BY h.nombre`,
    [userId],
  );
  return rows as Categoria[];
}

export async function setCandidatoHabilidades(userId: number, ids: number[]): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query('DELETE FROM candidato_habilidades WHERE id_usuario = ?', [userId]);
    if (ids.length > 0) {
      const placeholders = ids.map(() => '(?, ?)').join(', ');
      const params = ids.flatMap((id) => [userId, id]);
      await conn.query(
        `INSERT IGNORE INTO candidato_habilidades (id_usuario, id_habilidad) VALUES ${placeholders}`,
        params,
      );
    }
  });
}
