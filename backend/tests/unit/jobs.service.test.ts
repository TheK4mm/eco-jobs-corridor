import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as jobsRepo from '../../src/modules/jobs/jobs.repository';
import * as jobsService from '../../src/modules/jobs/jobs.service';
import type { AuthPayload } from '../../src/types/common';

vi.mock('../../src/modules/jobs/jobs.repository');

const empleador: AuthPayload = { id_usuario: 5, email: 'emp@example.com', rol: 'empleador' };

describe('jobs.service', () => {
  beforeEach(() => vi.resetAllMocks());

  it('getById lanza 404 cuando la oferta no existe', async () => {
    vi.mocked(jobsRepo.findById).mockResolvedValue(null);
    await expect(jobsService.getById(99)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('listPublic fuerza el estado "activa"', async () => {
    vi.mocked(jobsRepo.list).mockResolvedValue({ rows: [], total: 0 });
    await jobsService.listPublic({ page: 1, limit: 10 }, { q: 'guia' });
    expect(jobsRepo.list).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      expect.objectContaining({ estado: 'activa', q: 'guia' }),
    );
  });

  it('update lanza 403 cuando el solicitante no es el dueño', async () => {
    vi.mocked(jobsRepo.findOwnerId).mockResolvedValue(999);
    await expect(jobsService.update(empleador, 1, { titulo: 'Nuevo título' })).rejects.toMatchObject(
      { statusCode: 403 },
    );
  });

  it('remove lanza 404 cuando la oferta no existe', async () => {
    vi.mocked(jobsRepo.findOwnerId).mockResolvedValue(null);
    await expect(jobsService.remove(empleador, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});
