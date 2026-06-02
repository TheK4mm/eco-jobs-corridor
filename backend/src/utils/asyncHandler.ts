import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Envuelve un manejador asíncrono para que cualquier promesa rechazada se
 * reenvíe automáticamente al middleware de manejo de errores de Express.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
