import type { RowDataPacket } from 'mysql2';
import { query } from '../../config/db';

export interface AdminStats {
  usuarios: { total: number; por_rol: Array<{ rol: string; total: number }> };
  ofertas: { total: number; por_estado: Array<{ estado: string; total: number }> };
  postulaciones: { total: number; por_estado: Array<{ estado: string; total: number }> };
}

export async function getStats(): Promise<AdminStats> {
  const totalUsuarios = await query<RowDataPacket[]>('SELECT COUNT(*) AS n FROM usuarios');
  const porRol = await query<RowDataPacket[]>(
    `SELECT r.nombre AS rol, COUNT(*) AS total
     FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
     GROUP BY r.nombre`,
  );
  const totalOfertas = await query<RowDataPacket[]>('SELECT COUNT(*) AS n FROM ofertas');
  const ofertasPorEstado = await query<RowDataPacket[]>(
    'SELECT estado, COUNT(*) AS total FROM ofertas GROUP BY estado',
  );
  const totalPostulaciones = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS n FROM postulaciones',
  );
  const postulacionesPorEstado = await query<RowDataPacket[]>(
    'SELECT estado, COUNT(*) AS total FROM postulaciones GROUP BY estado',
  );

  return {
    usuarios: {
      total: Number(totalUsuarios[0].n),
      por_rol: porRol.map((r) => ({ rol: r.rol as string, total: Number(r.total) })),
    },
    ofertas: {
      total: Number(totalOfertas[0].n),
      por_estado: ofertasPorEstado.map((r) => ({ estado: r.estado as string, total: Number(r.total) })),
    },
    postulaciones: {
      total: Number(totalPostulaciones[0].n),
      por_estado: postulacionesPorEstado.map((r) => ({
        estado: r.estado as string,
        total: Number(r.total),
      })),
    },
  };
}
