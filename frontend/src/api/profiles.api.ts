import { api } from './client';
import type { Categoria, PerfilCandidato, PerfilEmpleador, Usuario } from '@/types';

export interface CandidatoProfileView {
  usuario: Usuario;
  perfil: PerfilCandidato | null;
  habilidades: Categoria[];
}

export interface EmpleadorProfileView {
  usuario: Usuario;
  perfil: PerfilEmpleador | null;
}

export interface CandidatoProfileInput {
  telefono?: string | null;
  titulo_profesional?: string | null;
  resumen?: string | null;
  ubicacion?: string | null;
  experiencia_anios?: number | null;
  url_cv?: string | null;
  habilidades?: number[];
}

export interface EmpleadorProfileInput {
  nombre_empresa: string;
  sector?: string | null;
  descripcion?: string | null;
  sitio_web?: string | null;
  ubicacion?: string | null;
  telefono?: string | null;
  logo_url?: string | null;
}

export const getMyCandidate = (): Promise<CandidatoProfileView> =>
  api.get<CandidatoProfileView>('/perfiles/candidate/me').then((r) => r.data);

export const upsertMyCandidate = (data: CandidatoProfileInput): Promise<CandidatoProfileView> =>
  api.put('/perfiles/candidate/me', data).then((r) => r.data);

export const getCandidate = (userId: number): Promise<CandidatoProfileView> =>
  api.get<CandidatoProfileView>(`/perfiles/candidate/${userId}`).then((r) => r.data);

export const getMyEmployer = (): Promise<EmpleadorProfileView> =>
  api.get<EmpleadorProfileView>('/perfiles/employer/me').then((r) => r.data);

export const upsertMyEmployer = (data: EmpleadorProfileInput): Promise<EmpleadorProfileView> =>
  api.put('/perfiles/employer/me', data).then((r) => r.data);

export const getEmployer = (userId: number): Promise<EmpleadorProfileView> =>
  api.get<EmpleadorProfileView>(`/perfiles/employer/${userId}`).then((r) => r.data);
