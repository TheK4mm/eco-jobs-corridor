import { createApp } from './app';
import { config } from './config/env';
import { closePool, healthCheck } from './config/db';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`✅ Servidor backend en http://localhost:${config.port}`);
  console.log(`   📚 Docs:   http://localhost:${config.port}/api/docs`);
  console.log(`   ❤  Health: http://localhost:${config.port}/api/v1/health`);
  console.log(`   🌱 Entorno: ${config.nodeEnv}`);
});

// Verificación temprana de la base de datos (no bloqueante)
void healthCheck()
  .then((ok) => {
    if (ok) console.log('✅ Conexión a la base de datos verificada.');
    else console.warn('⚠ No se pudo verificar la conexión a la base de datos.');
  })
  .catch((error: unknown) => {
    console.warn(
      '⚠ Base de datos no disponible:',
      error instanceof Error ? error.message : String(error),
    );
    console.warn('  Asegúrate de que MySQL (XAMPP) esté activo y ejecuta: npm run db:setup');
  });

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close(() => {
    void closePool().finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
