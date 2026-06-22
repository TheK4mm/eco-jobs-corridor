import * as usersRepo from '../users/users.repository';
import * as authRepo from './auth.repository';
import * as mailer from '../email/email.service';
import { comparePassword, hashPassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { generateOpaqueToken, hashToken } from '../../utils/tokens';
import {
  badRequest,
  conflict,
  notFound,
  tooManyRequests,
  unauthorized,
} from '../../utils/AppError';
import { config } from '../../config/env';
import { logger } from '../../config/logger';
import { ACCOUNT_LOCK, PASSWORD_RESET } from '../../constants/security';
import type { LoginInput, RegisterInput, ResetPasswordInput } from './auth.validation';
import type { Usuario, UsuarioPublico } from '../../types/models';
import type { Rol } from '../../types/common';

/** Datos de la petición que se guardan junto al refresh token. */
export interface ClientInfo {
  ip?: string | null;
  userAgent?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: UsuarioPublico;
}

function refreshExpiry(): Date {
  return new Date(Date.now() + config.jwt.refreshTokenDays * 24 * 60 * 60 * 1000);
}

/** Emite un access token (JWT) + un refresh token opaco y persiste el hash de este. */
async function issueTokens(
  payload: { id_usuario: number; email: string; rol: Rol },
  client: ClientInfo,
): Promise<AuthTokens> {
  const accessToken = signToken(payload);
  const refreshToken = generateOpaqueToken();
  await authRepo.createSession({
    id_usuario: payload.id_usuario,
    token_hash: hashToken(refreshToken),
    expira_en: refreshExpiry(),
    user_agent: client.userAgent ?? null,
    ip: client.ip ?? null,
  });
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<UsuarioPublico> {
  if (await usersRepo.emailExists(input.email)) {
    throw conflict('El correo ya está registrado', 'EMAIL_EN_USO');
  }

  const contrasena_hash = await hashPassword(input.contrasena);
  const id = await usersRepo.create({
    nombre: input.nombre,
    email: input.email,
    contrasena_hash,
    rol: input.rol,
  });

  const user = await usersRepo.findById(id);
  if (!user) throw notFound('No se pudo recuperar el usuario creado');
  void mailer.sendWelcome(user.email, user.nombre);
  return user;
}

export async function login(input: LoginInput, client: ClientInfo = {}): Promise<AuthResult> {
  const user = await usersRepo.findByEmailWithHash(input.email);
  if (!user || !user.contrasena_hash) {
    throw unauthorized('Correo o contraseña incorrectos', 'CREDENCIALES_INVALIDAS');
  }

  // ¿Cuenta bloqueada temporalmente por intentos fallidos?
  if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
    throw tooManyRequests(
      'Cuenta bloqueada temporalmente por intentos fallidos. Intenta más tarde.',
      'CUENTA_BLOQUEADA',
    );
  }

  const passwordOk = await comparePassword(input.contrasena, user.contrasena_hash);
  if (!passwordOk) {
    await registerFailedAttempt(user);
    throw unauthorized('Correo o contraseña incorrectos', 'CREDENCIALES_INVALIDAS');
  }

  if (!user.activo) {
    throw unauthorized(
      'Tu cuenta está desactivada. Contacta al administrador.',
      'CUENTA_DESACTIVADA',
    );
  }

  // Login correcto: limpia cualquier rastro de bloqueo.
  if (user.intentos_fallidos || user.bloqueado_hasta) {
    await usersRepo.updateLockState(user.id_usuario, 0, null);
  }

  const tokens = await issueTokens(
    { id_usuario: user.id_usuario, email: user.email, rol: user.rol as Rol },
    client,
  );
  const publicUser = (await usersRepo.findById(user.id_usuario)) as UsuarioPublico;
  return { ...tokens, user: publicUser };
}

/** Incrementa el contador de intentos y bloquea la cuenta al alcanzar el umbral. */
async function registerFailedAttempt(user: Usuario): Promise<void> {
  const attempts = (user.intentos_fallidos ?? 0) + 1;
  const lockUntil =
    attempts >= ACCOUNT_LOCK.maxAttempts
      ? new Date(Date.now() + ACCOUNT_LOCK.lockMinutes * 60 * 1000)
      : null;
  await usersRepo.updateLockState(user.id_usuario, attempts, lockUntil);
}

/**
 * Rota el refresh token: valida el actual, emite un par nuevo y revoca el viejo.
 * Si se presenta un token ya revocado (reuso → posible robo), revoca toda la familia.
 */
export async function refresh(refreshToken: string, client: ClientInfo = {}): Promise<AuthTokens> {
  const session = await authRepo.findSessionByHash(hashToken(refreshToken));
  if (!session) {
    throw unauthorized('Refresh token inválido', 'REFRESH_INVALIDO');
  }

  if (session.revocado) {
    await authRepo.revokeAllSessions(session.id_usuario);
    logger.warn(
      { id_usuario: session.id_usuario },
      'Reuso de refresh token detectado: se revocaron todas las sesiones',
    );
    throw unauthorized('Refresh token inválido', 'REFRESH_REUSO');
  }

  if (new Date(session.expira_en) <= new Date()) {
    throw unauthorized('Refresh token expirado', 'REFRESH_EXPIRADO');
  }

  const user = await usersRepo.findById(session.id_usuario);
  if (!user) {
    await authRepo.revokeSession(session.id_token);
    throw unauthorized('Usuario no encontrado', 'REFRESH_INVALIDO');
  }

  const accessToken = signToken({
    id_usuario: user.id_usuario,
    email: user.email,
    rol: user.rol as Rol,
  });
  const newRefresh = generateOpaqueToken();
  const newId = await authRepo.createSession({
    id_usuario: user.id_usuario,
    token_hash: hashToken(newRefresh),
    expira_en: refreshExpiry(),
    user_agent: client.userAgent ?? null,
    ip: client.ip ?? null,
  });
  await authRepo.revokeSession(session.id_token, newId);

  return { accessToken, refreshToken: newRefresh };
}

export async function logout(refreshToken: string): Promise<void> {
  const session = await authRepo.findSessionByHash(hashToken(refreshToken));
  if (session && !session.revocado) {
    await authRepo.revokeSession(session.id_token);
  }
}

export async function getMe(id: number): Promise<UsuarioPublico> {
  const user = await usersRepo.findById(id);
  if (!user) throw notFound('Usuario no encontrado');
  return user;
}

/**
 * Inicia la recuperación de contraseña. Responde de forma NEUTRA (no revela si
 * el email existe). En Fase 3 el enlace se enviará por correo; mientras tanto
 * se loguea y, fuera de producción, se devuelve para facilitar las pruebas.
 */
export async function forgotPassword(email: string): Promise<{ resetToken?: string }> {
  const user = await usersRepo.findByEmailWithHash(email);
  if (!user || !user.activo) return {};

  await authRepo.invalidatePendingResets(user.id_usuario);
  const resetToken = generateOpaqueToken(32);
  await authRepo.createResetToken({
    id_usuario: user.id_usuario,
    token_hash: hashToken(resetToken),
    expira_en: new Date(Date.now() + PASSWORD_RESET.ttlMinutes * 60 * 1000),
  });

  const enlace = `${config.appUrl}/restablecer?token=${resetToken}`;
  void mailer.sendPasswordReset(user.email, user.nombre, enlace);
  logger.info(
    { id_usuario: user.id_usuario, enlace },
    'Token de recuperación de contraseña generado',
  );
  return config.isProd ? {} : { resetToken };
}

/** Restablece la contraseña con un token válido y revoca todas las sesiones activas. */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const record = await authRepo.findResetByHash(hashToken(input.token));
  if (!record || record.usado || new Date(record.expira_en) <= new Date()) {
    throw badRequest(
      'El enlace de recuperación es inválido o ha expirado',
      undefined,
      'RESET_INVALIDO',
    );
  }

  const contrasena_hash = await hashPassword(input.contrasena);
  await usersRepo.updatePassword(record.id_usuario, contrasena_hash);
  await authRepo.markResetUsed(record.id_token);
  // Tras cambiar la contraseña, invalida sesiones y otros tokens de recuperación.
  await authRepo.revokeAllSessions(record.id_usuario);
  await authRepo.invalidatePendingResets(record.id_usuario);
}
