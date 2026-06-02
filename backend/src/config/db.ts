import mysql, {
  type Pool,
  type PoolConnection,
  type RowDataPacket,
  type ResultSetHeader,
} from 'mysql2/promise';
import { config } from './env';

/**
 * Pool de conexiones MySQL. Centraliza el acceso a datos: los repositorios
 * usan estos helpers para ejecutar SQL siempre parametrizado.
 */
export const pool: Pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
});

/** Ejecuta un SELECT y devuelve las filas tipadas. */
export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

/** Ejecuta INSERT/UPDATE/DELETE y devuelve el resultado (affectedRows, insertId...). */
export async function execute(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return result;
}

/**
 * Ejecuta una función dentro de una transacción. Hace commit si todo va bien
 * y rollback ante cualquier error. Útil para operaciones atómicas
 * (p. ej. crear postulación + notificación).
 */
export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/** Verifica la conectividad con la base de datos (usado por /health). */
export async function healthCheck(): Promise<boolean> {
  const rows = await query<RowDataPacket[]>('SELECT 1 AS ok');
  return rows.length > 0;
}

export async function closePool(): Promise<void> {
  await pool.end();
}
