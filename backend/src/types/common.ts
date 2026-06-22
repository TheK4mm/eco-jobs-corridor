// El tipo Rol vive en la fuente única de enumerados.
export type { Rol } from '../constants/enums';
import type { Rol } from '../constants/enums';

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
