import pino from 'pino';
import { config } from './env';

/**
 * Logger estructurado de la aplicación (reemplaza `console.*` y morgan).
 *
 * - Producción: JSON en una línea (apto para agregadores: Datadog, Loki, ELK).
 * - Desarrollo: salida legible y coloreada vía `pino-pretty`.
 * - Test: deshabilitado para no ensuciar la salida de Vitest.
 *
 * Cada petición HTTP obtiene un logger hijo con `reqId` mediante `pino-http`
 * (ver `middleware/httpLogger`), de modo que todos los logs de una petición
 * se pueden correlacionar.
 */
export const logger = pino({
  level: config.logLevel,
  enabled: !config.isTest,
  transport: config.isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export type Logger = typeof logger;
