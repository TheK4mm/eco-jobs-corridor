/**
 * Error HTTP con código de estado. Los servicios lanzan estos errores y el
 * middleware central (errorHandler) los traduce a respuestas JSON uniformes.
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const badRequest = (message = 'Solicitud inválida', details?: unknown): HttpError =>
  new HttpError(400, message, details);

export const unauthorized = (message = 'No autenticado'): HttpError =>
  new HttpError(401, message);

export const forbidden = (message = 'No tienes permiso para esta acción'): HttpError =>
  new HttpError(403, message);

export const notFound = (message = 'Recurso no encontrado'): HttpError =>
  new HttpError(404, message);

export const conflict = (message = 'El recurso ya existe o genera un conflicto'): HttpError =>
  new HttpError(409, message);
