export type Rol = 'admin' | 'empleador' | 'candidato';

/** Carga útil que viaja dentro del JWT. */
export interface AuthPayload {
  id_usuario: number;
  email: string;
  rol: Rol;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
