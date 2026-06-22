/**
 * Parámetros de seguridad centralizados (antes hardcodeados en `app.ts` y
 * `auth.routes.ts`). Tenerlos aquí evita números mágicos duplicados.
 */

const QUINCE_MINUTOS = 15 * 60 * 1000;

/** Configuración de los limitadores de tasa (express-rate-limit). */
export const RATE_LIMIT = {
  /** Límite global por IP para toda la API. */
  global: { windowMs: QUINCE_MINUTOS, max: 300 },
  /** Límite más estricto para endpoints de autenticación (anti fuerza bruta). */
  auth: { windowMs: QUINCE_MINUTOS, max: 20 },
} as const;

/** Bloqueo de cuenta por intentos de login fallidos (defensa por cuenta, no por IP). */
export const ACCOUNT_LOCK = {
  /** Intentos fallidos consecutivos antes de bloquear. */
  maxAttempts: 5,
  /** Minutos que dura el bloqueo una vez alcanzado el límite. */
  lockMinutes: 15,
} as const;

/** Vigencia del token de recuperación de contraseña (un solo uso). */
export const PASSWORD_RESET = {
  ttlMinutes: 60,
} as const;
