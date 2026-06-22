/**
 * Error HTTP con código de estado. Los servicios lanzan estos errores y el
 * middleware central (errorHandler) los traduce a respuestas JSON uniformes.
 *
 * `code` es un identificador estable y legible por máquina (p. ej. `EMAIL_EN_USO`)
 * que el frontend puede usar para i18n o lógica específica, sin depender del
 * texto del `message`. Es opcional para mantener compatibilidad con el código
 * existente.
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const badRequest = (
  message = 'Solicitud inválida',
  details?: unknown,
  code?: string,
): HttpError => new HttpError(400, message, details, code);

export const unauthorized = (message = 'No autenticado', code?: string): HttpError =>
  new HttpError(401, message, undefined, code);

export const forbidden = (
  message = 'No tienes permiso para esta acción',
  code?: string,
): HttpError => new HttpError(403, message, undefined, code);

export const notFound = (message = 'Recurso no encontrado', code?: string): HttpError =>
  new HttpError(404, message, undefined, code);

export const conflict = (
  message = 'El recurso ya existe o genera un conflicto',
  code?: string,
): HttpError => new HttpError(409, message, undefined, code);
