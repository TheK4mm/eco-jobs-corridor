import { createHash, randomBytes } from 'node:crypto';

/**
 * Utilidades para tokens opacos (refresh y recuperación de contraseña).
 *
 * Se entrega al cliente el token en claro (alta entropía) pero en la base de
 * datos solo se guarda su hash SHA-256: si la BD se ve comprometida, los
 * tokens no son utilizables. Al validar, se hashea el token recibido y se
 * compara contra el hash almacenado.
 */

/** Genera un token opaco aleatorio (por defecto 48 bytes → 96 hex). */
export function generateOpaqueToken(bytes = 48): string {
  return randomBytes(bytes).toString('hex');
}

/** Hash determinista (SHA-256) para almacenar/buscar tokens sin guardarlos en claro. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
