import * as auditRepo from './audit.repository';
import { logger } from '../../config/logger';
import { buildPaginated } from '../../utils/pagination';
import type { AuditInput } from './audit.repository';
import type { PaginationParams } from '../../types/common';

/**
 * Registra un evento de auditoría. Es "best-effort": un fallo al auditar
 * NUNCA debe romper la operación de negocio, así que se captura y se loguea.
 */
export async function registrar(entry: AuditInput): Promise<void> {
  try {
    await auditRepo.insert(entry);
  } catch (error) {
    logger.error({ err: error, entry }, 'No se pudo registrar el evento de auditoría');
  }
}

export async function listar(
  pagination: PaginationParams,
  filters: { entidad?: string; accion?: string } = {},
) {
  const { rows, total } = await auditRepo.list(pagination, filters);
  return buildPaginated(rows, total, pagination);
}
