import type { ErrorRequestHandler, Request } from 'express';
import { HttpError } from '../utils/AppError';
import { config } from '../config/env';
import { logger, type Logger } from '../config/logger';

/** Manejo de errores centralizado: respuestas JSON uniformes, sin filtrar stacks en producción. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // `pino-http` adjunta un logger hijo con el reqId; si no existe, usa el global.
  const log: Logger = (req as Request & { log?: Logger }).log ?? logger;

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  const dbCode = (err as { code?: string }).code;

  if (dbCode === 'ER_DUP_ENTRY') {
    res
      .status(409)
      .json({ message: 'El registro ya existe (valor duplicado).', code: 'RECURSO_DUPLICADO' });
    return;
  }

  if (dbCode === 'ECONNREFUSED' || dbCode === 'ER_ACCESS_DENIED_ERROR' || dbCode === 'ENOTFOUND') {
    log.error({ err }, 'Error de conexión a la base de datos');
    res.status(503).json({
      message: 'Servicio no disponible: error de base de datos.',
      code: 'DB_NO_DISPONIBLE',
    });
    return;
  }

  log.error({ err }, 'Error no controlado');
  res.status(500).json({
    message: 'Error interno del servidor',
    code: 'ERROR_INTERNO',
    ...(config.isProd ? {} : { detail: (err as Error)?.message }),
  });
};
