import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';

/** Fila de la tabla tokens_sesion (refresh tokens). */
export interface SesionToken extends RowDataPacket {
  id_token: number;
  id_usuario: number;
  token_hash: string;
  expira_en: Date | string;
  revocado: number;
  reemplazado_por: number | null;
}

/** Fila de la tabla tokens_recuperacion (reset de contraseña). */
export interface RecuperacionToken extends RowDataPacket {
  id_token: number;
  id_usuario: number;
  token_hash: string;
  expira_en: Date | string;
  usado: number;
}

// ── Refresh tokens (tokens_sesion) ──────────────────────────────────────

export async function createSession(input: {
  id_usuario: number;
  token_hash: string;
  expira_en: Date;
  user_agent?: string | null;
  ip?: string | null;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO tokens_sesion (id_usuario, token_hash, expira_en, user_agent, ip)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.id_usuario,
      input.token_hash,
      input.expira_en,
      input.user_agent ?? null,
      input.ip ?? null,
    ],
  );
  return result.insertId;
}

export async function findSessionByHash(token_hash: string): Promise<SesionToken | null> {
  const rows = await query<SesionToken[]>('SELECT * FROM tokens_sesion WHERE token_hash = ?', [
    token_hash,
  ]);
  return rows[0] ?? null;
}

/** Marca un refresh token como revocado (opcionalmente enlazando su reemplazo). */
export async function revokeSession(
  id_token: number,
  reemplazado_por: number | null = null,
): Promise<void> {
  await execute('UPDATE tokens_sesion SET revocado = 1, reemplazado_por = ? WHERE id_token = ?', [
    reemplazado_por,
    id_token,
  ]);
}

/** Revoca todas las sesiones activas de un usuario (logout global / reuso detectado). */
export async function revokeAllSessions(id_usuario: number): Promise<number> {
  const result = await execute(
    'UPDATE tokens_sesion SET revocado = 1 WHERE id_usuario = ? AND revocado = 0',
    [id_usuario],
  );
  return result.affectedRows;
}

// ── Reset de contraseña (tokens_recuperacion) ───────────────────────────

export async function createResetToken(input: {
  id_usuario: number;
  token_hash: string;
  expira_en: Date;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO tokens_recuperacion (id_usuario, token_hash, expira_en)
     VALUES (?, ?, ?)`,
    [input.id_usuario, input.token_hash, input.expira_en],
  );
  return result.insertId;
}

export async function findResetByHash(token_hash: string): Promise<RecuperacionToken | null> {
  const rows = await query<RecuperacionToken[]>(
    'SELECT * FROM tokens_recuperacion WHERE token_hash = ?',
    [token_hash],
  );
  return rows[0] ?? null;
}

export async function markResetUsed(id_token: number): Promise<void> {
  await execute('UPDATE tokens_recuperacion SET usado = 1 WHERE id_token = ?', [id_token]);
}

/** Invalida los tokens de recuperación pendientes de un usuario (al pedir uno nuevo o tras usarlo). */
export async function invalidatePendingResets(id_usuario: number): Promise<void> {
  await execute('UPDATE tokens_recuperacion SET usado = 1 WHERE id_usuario = ? AND usado = 0', [
    id_usuario,
  ]);
}
