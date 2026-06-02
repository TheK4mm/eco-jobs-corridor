import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { badRequest } from '../utils/AppError';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Valida y normaliza la entrada de la petición con esquemas Zod.
 * `body` se reemplaza por el valor parseado; en `query`/`params` se escriben
 * los valores ya coercionados sobre el objeto existente (no se reasigna el
 * getter de Express).
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        Object.assign(req.query, schemas.query.parse(req.query));
      }
      if (schemas.params) {
        Object.assign(req.params, schemas.params.parse(req.params));
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(badRequest('Datos de entrada inválidos', error.flatten().fieldErrors));
        return;
      }
      next(error);
    }
  };
}
