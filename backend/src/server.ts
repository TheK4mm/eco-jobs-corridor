import { createApp } from './app';
import { config } from './config/env';
import { closePool, healthCheck } from './config/db';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(
    {
      url: `http://localhost:${config.port}`,
      docs: `http://localhost:${config.port}/api/docs`,
      health: `http://localhost:${config.port}/api/v1/health`,
      env: config.nodeEnv,
    },
    'Servidor backend iniciado',
  );
});

// Verificación temprana de la base de datos (no bloqueante).
void healthCheck()
  .then((ok) => {
    if (ok) logger.info('Conexión a la base de datos verificada');
    else logger.warn('No se pudo verificar la conexión a la base de datos');
  })
  .catch((error: unknown) => {
    logger.warn(
      { err: error },
      'Base de datos no disponible. Asegúrate de que MySQL esté activo y ejecuta: npm run db:setup',
    );
  });

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Señal recibida. Cerrando servidor...');
  server.close(() => {
    void closePool().finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
