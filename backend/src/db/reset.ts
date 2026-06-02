import mysql from 'mysql2/promise';
import { config } from '../config/env';
import { runSeed } from './seed';

/**
 * Elimina por completo la base de datos y la recrea (migraciones + seed).
 * ⚠ Destruye todos los datos. Útil en desarrollo y para las pruebas.
 */
export async function resetDatabase(): Promise<void> {
  const dbName = config.db.database;
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
  });

  try {
    console.log(`⚠ Eliminando base de datos "${dbName}"...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  } finally {
    await connection.end();
  }

  await runSeed(); // runMigrations (recrea la BD + esquema) + datos demo
  console.log('✔ Base de datos reiniciada.');
}

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error reiniciando la base de datos:', error);
      process.exit(1);
    });
}
