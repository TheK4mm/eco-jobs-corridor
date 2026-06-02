import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/AppError';
import { config } from '../config/env';

/** Manejo de errores centralizado: respuestas JSON uniformes, sin filtrar stacks en producción. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  const code = (err as { code?: string }).code;

  if (code === 'ER_DUP_ENTRY') {
    res.status(409).json({ message: 'El registro ya existe (valor duplicado).' });
    return;
  }

  if (code === 'ECONNREFUSED' || code === 'ER_ACCESS_DENIED_ERROR' || code === 'ENOTFOUND') {
    console.error('❌ Error de conexión a la base de datos:', err);
    res.status(503).json({ message: 'Servicio no disponible: error de base de datos.' });
    return;
  }

  console.error('❌ Error no controlado:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    ...(config.isProd ? {} : { detail: (err as Error)?.message }),
  });
};
