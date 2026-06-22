import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import type { ClientInfo } from './auth.service';

/** Extrae IP y user-agent de la petición para asociarlos al refresh token. */
function clientInfo(req: Request): ClientInfo {
  return { ip: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json({ message: 'Usuario registrado con éxito', user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, clientInfo(req));
  res.json({ message: 'Inicio de sesión exitoso', ...result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(req.body.refreshToken, clientInfo(req));
  res.json(tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.json({ message: 'Sesión cerrada' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json({
    message:
      'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.',
    ...result,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  res.json({ message: 'Contraseña actualizada correctamente. Inicia sesión nuevamente.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id_usuario);
  res.json(user);
});
