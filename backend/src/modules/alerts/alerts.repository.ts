import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';
import type { CreateAlertInput } from './alerts.validation';
import type { Oferta } from '../../types/models';

export interface Alerta extends RowDataPacket {
  id_alerta: number;
  id_usuario: number;
  palabra_clave: string | null;
  id_categoria: number | null;
  categoria: string | null;
  modalidad: string | null;
  activa: number;
  fecha_creacion: Date | string;
}

export interface AlertaDestinatario extends RowDataPacket {
  id_usuario: number;
  email: string;
  nombre: string;
}

export async function create(id_usuario: number, input: CreateAlertInput): Promise<number> {
  const result = await execute(
    `INSERT INTO alertas_empleo (id_usuario, palabra_clave, id_categoria, modalidad)
     VALUES (?, ?, ?, ?)`,
    [id_usuario, input.palabra_clave ?? null, input.id_categoria ?? null, input.modalidad ?? null],
  );
  return result.insertId;
}

export async function listByUser(id_usuario: number): Promise<Alerta[]> {
  return query<Alerta[]>(
    `SELECT a.*, c.nombre AS categoria
       FROM alertas_empleo a
       LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
      WHERE a.id_usuario = ?
      ORDER BY a.fecha_creacion DESC`,
    [id_usuario],
  );
}

export async function remove(id_alerta: number, id_usuario: number): Promise<number> {
  const result = await execute(
    'DELETE FROM alertas_empleo WHERE id_alerta = ? AND id_usuario = ?',
    [id_alerta, id_usuario],
  );
  return result.affectedRows;
}

/**
 * Devuelve los destinatarios cuyas alertas activas coinciden con una oferta
 * recién publicada (excluye al propio empleador y cuentas inactivas/borradas).
 */
export async function findMatching(oferta: Oferta): Promise<AlertaDestinatario[]> {
  return query<AlertaDestinatario[]>(
    `SELECT DISTINCT u.id_usuario, u.email, u.nombre
       FROM alertas_empleo a
       JOIN usuarios u ON a.id_usuario = u.id_usuario
        AND u.deleted_at IS NULL AND u.activo = 1
      WHERE a.activa = 1
        AND a.id_usuario <> ?
        AND (a.palabra_clave IS NULL
             OR ? LIKE CONCAT('%', a.palabra_clave, '%')
             OR ? LIKE CONCAT('%', a.palabra_clave, '%'))
        AND (a.id_categoria IS NULL OR a.id_categoria = ?)
        AND (a.modalidad IS NULL OR a.modalidad = ?)`,
    [oferta.id_empleador, oferta.titulo, oferta.descripcion, oferta.id_categoria, oferta.modalidad],
  );
}
