import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';
import { getOffset } from '../../utils/pagination';
import type { PaginationParams, Rol } from '../../types/common';
import type { Usuario, UsuarioPublico } from '../../types/models';

const PUBLIC_FIELDS = `
  u.id_usuario, u.nombre, u.email, r.nombre AS rol, u.id_rol,
  u.activo, u.fecha_registro, u.fecha_actualizacion`;

/** Usuario con hash de contraseña incluido (solo para login). Excluye borrados lógicos. */
export async function findByEmailWithHash(email: string): Promise<Usuario | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT u.*, r.nombre AS rol
     FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.email = ? AND u.deleted_at IS NULL`,
    [email],
  );
  return (rows[0] as Usuario) ?? null;
}

export async function findById(id: number): Promise<UsuarioPublico | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT ${PUBLIC_FIELDS}
     FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ? AND u.deleted_at IS NULL`,
    [id],
  );
  return (rows[0] as UsuarioPublico) ?? null;
}

export async function emailExists(email: string, exceptId?: number): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id_usuario FROM usuarios WHERE email = ?${exceptId ? ' AND id_usuario <> ?' : ''}`,
    exceptId ? [email, exceptId] : [email],
  );
  return rows.length > 0;
}

export async function create(input: {
  nombre: string;
  email: string;
  contrasena_hash: string;
  rol: Rol;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO usuarios (nombre, email, contrasena_hash, id_rol)
     VALUES (?, ?, ?, (SELECT id_rol FROM roles WHERE nombre = ?))`,
    [input.nombre, input.email, input.contrasena_hash, input.rol],
  );
  return result.insertId;
}

export async function updateBasic(
  id: number,
  fields: { nombre?: string; email?: string },
): Promise<number> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (fields.nombre !== undefined) {
    sets.push('nombre = ?');
    params.push(fields.nombre);
  }
  if (fields.email !== undefined) {
    sets.push('email = ?');
    params.push(fields.email);
  }
  if (sets.length === 0) return 0;
  params.push(id);
  const result = await execute(
    `UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = ?`,
    params,
  );
  return result.affectedRows;
}

export async function updatePassword(id: number, contrasena_hash: string): Promise<number> {
  const result = await execute('UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?', [
    contrasena_hash,
    id,
  ]);
  return result.affectedRows;
}

export async function updateRole(id: number, rol: Rol): Promise<number> {
  const result = await execute(
    `UPDATE usuarios SET id_rol = (SELECT id_rol FROM roles WHERE nombre = ?) WHERE id_usuario = ?`,
    [rol, id],
  );
  return result.affectedRows;
}

export async function setActivo(id: number, activo: boolean): Promise<number> {
  const result = await execute('UPDATE usuarios SET activo = ? WHERE id_usuario = ?', [
    activo ? 1 : 0,
    id,
  ]);
  return result.affectedRows;
}

/**
 * Actualiza el estado de bloqueo por intentos fallidos.
 * Con (0, null) limpia el bloqueo tras un login exitoso.
 */
export async function updateLockState(
  id: number,
  intentos_fallidos: number,
  bloqueado_hasta: Date | null,
): Promise<number> {
  const result = await execute(
    'UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id_usuario = ?',
    [intentos_fallidos, bloqueado_hasta, id],
  );
  return result.affectedRows;
}

/**
 * Borrado LÓGICO: marca `deleted_at` y desactiva la cuenta. Conserva el
 * histórico (ofertas, postulaciones, auditoría) en lugar de borrarlo en cascada.
 * El email queda ocupado para impedir su reutilización/suplantación.
 */
export async function remove(id: number): Promise<number> {
  const result = await execute(
    'UPDATE usuarios SET deleted_at = CURRENT_TIMESTAMP, activo = 0 WHERE id_usuario = ? AND deleted_at IS NULL',
    [id],
  );
  return result.affectedRows;
}

export async function list(
  pagination: PaginationParams,
  filters: { rol?: Rol; q?: string; activo?: boolean } = {},
): Promise<{ rows: UsuarioPublico[]; total: number }> {
  const where: string[] = ['u.deleted_at IS NULL'];
  const params: unknown[] = [];

  if (filters.rol) {
    where.push('r.nombre = ?');
    params.push(filters.rol);
  }
  if (typeof filters.activo === 'boolean') {
    where.push('u.activo = ?');
    params.push(filters.activo ? 1 : 0);
  }
  if (filters.q) {
    where.push('(u.nombre LIKE ? OR u.email LIKE ?)');
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol ${whereSql}`,
    params,
  );
  const total = Number(countRows[0].total);

  const rows = await query<RowDataPacket[]>(
    `SELECT ${PUBLIC_FIELDS}
     FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
     ${whereSql}
     ORDER BY u.fecha_registro DESC
     LIMIT ? OFFSET ?`,
    [...params, pagination.limit, getOffset(pagination)],
  );

  return { rows: rows as UsuarioPublico[], total };
}
