import type { Paginated, PaginationParams } from '../types/common';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePagination(query: { page?: unknown; limit?: unknown }): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  return { page, limit };
}

export function getOffset({ page, limit }: PaginationParams): number {
  return (page - 1) * limit;
}

export function buildPaginated<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams,
): Paginated<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
