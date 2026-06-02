import type { RowDataPacket } from 'mysql2';
import { execute, query } from '../../config/db';
import type { Categoria } from '../../types/models';

export async function list(): Promise<Categoria[]> {
  const rows = await query<RowDataPacket[]>(
    'SELECT id_categoria, nombre FROM categorias ORDER BY nombre',
  );
  return rows as Categoria[];
}

export async function findById(id: number): Promise<Categoria | null> {
  const rows = await query<RowDataPacket[]>(
    'SELECT id_categoria, nombre FROM categorias WHERE id_categoria = ?',
    [id],
  );
  return (rows[0] as Categoria) ?? null;
}

export async function create(nombre: string): Promise<number> {
  const result = await execute('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
  return result.insertId;
}

export async function update(id: number, nombre: string): Promise<number> {
  const result = await execute('UPDATE categorias SET nombre = ? WHERE id_categoria = ?', [
    nombre,
    id,
  ]);
  return result.affectedRows;
}

export async function remove(id: number): Promise<number> {
  const result = await execute('DELETE FROM categorias WHERE id_categoria = ?', [id]);
  return result.affectedRows;
}
