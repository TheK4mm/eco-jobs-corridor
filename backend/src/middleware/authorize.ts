import type { NextFunction, Request, Response } from 'express';
import type { Rol } from '../types/common';
import { forbidden, unauthorized } from '../utils/AppError';

/**
 * Control de acceso por rol (RBAC). Debe usarse después del middleware `auth`.
 * Ejemplo: router.post('/', auth, authorize('empleador', 'admin'), handler)
 */
export function authorize(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw unauthorized();
    }
    if (roles.length > 0 && !roles.includes(req.user.rol)) {
      throw forbidden('No cuentas con el rol necesario para esta acción');
    }
    next();
  };
}
