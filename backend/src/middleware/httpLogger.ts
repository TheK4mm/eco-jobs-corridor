import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import { logger } from '../config/logger';

/**
 * Middleware de logging HTTP. Asigna a cada petición un `reqId` (reutiliza el
 * header `x-request-id` si el cliente/proxy lo envía, o genera un UUID) y lo
 * devuelve en la respuesta para poder rastrear una petición de extremo a extremo.
 * Expone `req.log`, un logger hijo con el `reqId` ya incluido.
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const header = req.headers['x-request-id'];
    const id = (Array.isArray(header) ? header[0] : header) ?? randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  // Nivel de log según el resultado: errores 5xx → error, 4xx → warn, resto → info.
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
