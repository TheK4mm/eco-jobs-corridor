import fs from 'node:fs';
import path from 'node:path';
import mysql, { type RowDataPacket } from 'mysql2/promise';
import { config } from '../config/env';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Crea la base de datos si no existe y aplica las migraciones SQL pendientes
 * (archivos *.sql ordenados por nombre). El control de versiones se guarda en
 * la tabla `schema_migrations`, de modo que cada migración se ejecuta una vez.
 */
export async function runMigrations(): Promise<void> {
  const dbName = config.db.database;

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE \`${dbName}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (version)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [appliedRows] = await connection.query<RowDataPacket[]>(
      'SELECT version FROM schema_migrations',
    );
    const applied = new Set(appliedRows.map((row) => row.version as string));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`▶ Aplicando migración: ${file}`);
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (version) VALUES (?)', [file]);
      count += 1;
    }

    if (count === 0) {
      console.log('✔ Base de datos al día (sin migraciones pendientes).');
    } else {
      console.log(`✔ ${count} migración(es) aplicada(s) sobre "${dbName}".`);
    }
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error ejecutando migraciones:', error);
      process.exit(1);
    });
}
