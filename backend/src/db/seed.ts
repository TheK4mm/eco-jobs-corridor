import mysql, { type Connection, type RowDataPacket } from 'mysql2/promise';
import { config } from '../config/env';
import { hashPassword } from '../utils/password';
import { runMigrations } from './migrate';

interface SeedUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'empleador' | 'candidato';
}

async function upsertUsuario(conn: Connection, usuario: SeedUsuario): Promise<number> {
  const hash = await hashPassword(usuario.password);
  await conn.query(
    `INSERT INTO usuarios (nombre, email, contrasena_hash, id_rol)
     VALUES (?, ?, ?, (SELECT id_rol FROM roles WHERE nombre = ?))
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), id_rol = VALUES(id_rol)`,
    [usuario.nombre, usuario.email, hash, usuario.rol],
  );
  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT id_usuario FROM usuarios WHERE email = ?',
    [usuario.email],
  );
  return rows[0].id_usuario as number;
}

async function getCategoriaId(conn: Connection, nombre: string): Promise<number> {
  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT id_categoria FROM categorias WHERE nombre = ?',
    [nombre],
  );
  return rows[0].id_categoria as number;
}

/** Inserta el administrador inicial y datos de demostración (idempotente). */
export async function runSeed(): Promise<void> {
  await runMigrations(); // garantiza el esquema antes de sembrar

  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    // 1) Administrador (credenciales desde .env)
    await upsertUsuario(conn, {
      nombre: config.admin.name,
      email: config.admin.email,
      password: config.admin.password,
      rol: 'admin',
    });

    // 2) Empleador demo + perfil
    const empleadorId = await upsertUsuario(conn, {
      nombre: 'EcoTurismo Villavicencio',
      email: 'empleador@corredorempleo.co',
      password: 'Empleador123*',
      rol: 'empleador',
    });
    await conn.query(
      `INSERT INTO perfiles_empleador (id_usuario, nombre_empresa, sector, descripcion, sitio_web, ubicacion, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre_empresa = VALUES(nombre_empresa), sector = VALUES(sector)`,
      [
        empleadorId,
        'EcoTurismo Villavicencio S.A.S.',
        'Turismo y Hotelería',
        'Empresa dedicada al ecoturismo sostenible en el Corredor Ecológico.',
        'https://ecoturismovillavo.example.co',
        'Villavicencio, Meta',
        '+57 320 000 0000',
      ],
    );

    // 3) Candidato demo + perfil + habilidades
    const candidatoId = await upsertUsuario(conn, {
      nombre: 'Laura Gómez',
      email: 'candidato@corredorempleo.co',
      password: 'Candidato123*',
      rol: 'candidato',
    });
    await conn.query(
      `INSERT INTO perfiles_candidato (id_usuario, telefono, titulo_profesional, resumen, ubicacion, experiencia_anios)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo_profesional = VALUES(titulo_profesional)`,
      [
        candidatoId,
        '+57 310 111 2222',
        'Técnica en Turismo',
        'Apasionada por el turismo sostenible y la atención al cliente.',
        'Villavicencio, Meta',
        3,
      ],
    );
    await conn.query(
      `INSERT IGNORE INTO candidato_habilidades (id_usuario, id_habilidad)
       SELECT ?, id_habilidad FROM habilidades WHERE nombre IN ('Atención al cliente', 'Guía turístico', 'Trabajo en equipo')`,
      [candidatoId],
    );

    // 4) Ofertas demo (solo si la tabla está vacía, para no duplicar)
    const [count] = await conn.query<RowDataPacket[]>('SELECT COUNT(*) AS n FROM ofertas');
    if ((count[0].n as number) === 0) {
      const turismo = await getCategoriaId(conn, 'Turismo y Hotelería');
      const agro = await getCategoriaId(conn, 'Agricultura y Medio Ambiente');
      const comercio = await getCategoriaId(conn, 'Comercio y Ventas');

      const ofertas: Array<[number | null, string, string, string, string, string, string, number, number]> = [
        [turismo, 'Guía Turístico Bilingüe', 'Acompañamiento de turistas en recorridos por el Corredor Ecológico. Indispensable inglés intermedio.', 'EcoTurismo Villavicencio S.A.S.', 'Villavicencio, Meta', 'presencial', 'tiempo_completo', 1800000, 2400000],
        [agro, 'Operario Agrícola Sostenible', 'Manejo de cultivos con prácticas sostenibles y cuidado ambiental.', 'EcoTurismo Villavicencio S.A.S.', 'Acacías, Meta', 'presencial', 'tiempo_completo', 1300000, 1600000],
        [comercio, 'Asesor Comercial', 'Atención y asesoría a clientes, manejo de ventas en punto físico.', 'EcoTurismo Villavicencio S.A.S.', 'Villavicencio, Meta', 'hibrido', 'medio_tiempo', 1000000, 1400000],
        [turismo, 'Recepcionista de Hotel', 'Atención al huésped, check-in/check-out y servicio al cliente.', 'EcoTurismo Villavicencio S.A.S.', 'Restrepo, Meta', 'presencial', 'tiempo_completo', 1300000, 1500000],
        [agro, 'Coordinador Ambiental', 'Diseño y seguimiento de proyectos de conservación del corredor.', 'EcoTurismo Villavicencio S.A.S.', 'Villavicencio, Meta', 'remoto', 'temporal', 2500000, 3200000],
      ];

      for (const [cat, titulo, desc, empresa, ubic, modalidad, contrato, smin, smax] of ofertas) {
        await conn.query(
          `INSERT INTO ofertas
             (id_empleador, id_categoria, titulo, descripcion, empresa, ubicacion, modalidad, tipo_contrato, salario_min, salario_max, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activa')`,
          [empleadorId, cat, titulo, desc, empresa, ubic, modalidad, contrato, smin, smax],
        );
      }
      console.log(`✔ ${ofertas.length} ofertas de ejemplo insertadas.`);
    }

    console.log('✔ Seed completado.');
    console.log('   Admin:     ', config.admin.email, '/', config.admin.password);
    console.log('   Empleador:  empleador@corredorempleo.co / Empleador123*');
    console.log('   Candidato:  candidato@corredorempleo.co / Candidato123*');
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error ejecutando el seed:', error);
      process.exit(1);
    });
}
