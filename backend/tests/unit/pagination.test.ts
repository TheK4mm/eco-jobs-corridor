import { describe, expect, it } from 'vitest';
import { buildPaginated, getOffset, parsePagination } from '../../src/utils/pagination';

describe('utils/pagination', () => {
  it('aplica valores por defecto', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10 });
  });

  it('limita el tamaño de página a 100', () => {
    expect(parsePagination({ page: '3', limit: '500' })).toEqual({ page: 3, limit: 100 });
  });

  it('normaliza valores inválidos', () => {
    expect(parsePagination({ page: '-5', limit: 'abc' })).toEqual({ page: 1, limit: 10 });
  });

  it('calcula el offset correctamente', () => {
    expect(getOffset({ page: 1, limit: 10 })).toBe(0);
    expect(getOffset({ page: 4, limit: 10 })).toBe(30);
  });

  it('construye el objeto paginado', () => {
    const result = buildPaginated([1, 2, 3], 23, { page: 1, limit: 10 });
    expect(result.data).toHaveLength(3);
    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 23, totalPages: 3 });
  });
});
