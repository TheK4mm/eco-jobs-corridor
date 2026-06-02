import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { unauthorized } from '../utils/AppError';

/**
 * Verifica el JWT del header Authorization y adjunta el usuario a req.user.
 * Única fuente de verdad para la autenticación (reemplaza los middlewares
 * duplicados que existían en cada archivo de rutas).
 */
export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) {
    throw unauthorized('Token requerido');
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw unauthorized('Formato de token inválido. Usa: Bearer <token>');
  }

  try {
    req.user = verifyToken(token);
  } catch {
    throw unauthorized('Token inválido o expirado');
  }

  next();
}
