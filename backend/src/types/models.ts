import type { Rol } from './common';
import type { Modalidad, TipoContrato, EstadoOferta, EstadoPostulacion } from '../constants/enums';

// Re-exporta los enumerados del dominio desde su fuente única para no romper
// los imports existentes (`import { Modalidad } from '../types/models'`).
export type { Modalidad, TipoContrato, EstadoOferta, EstadoPostulacion };

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  contrasena_hash?: string; // jamás se serializa hacia la API
  id_rol: number;
  rol?: Rol; // proveniente del JOIN con la tabla roles
  activo: number | boolean;
  fecha_registro: Date | string;
  fecha_actualizacion: Date | string;
}

export type UsuarioPublico = Omit<Usuario, 'contrasena_hash'>;

export interface PerfilCandidato {
  id_perfil: number;
  id_usuario: number;
  telefono: string | null;
  titulo_profesional: string | null;
  resumen: string | null;
  ubicacion: string | null;
  experiencia_anios: number | null;
  url_cv: string | null;
}

export interface PerfilEmpleador {
  id_perfil: number;
  id_usuario: number;
  nombre_empresa: string;
  sector: string | null;
  descripcion: string | null;
  sitio_web: string | null;
  ubicacion: string | null;
  telefono: string | null;
  logo_url: string | null;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Oferta {
  id_oferta: number;
  id_empleador: number;
  id_categoria: number | null;
  titulo: string;
  descripcion: string;
  empresa: string | null;
  ubicacion: string;
  modalidad: Modalidad;
  tipo_contrato: TipoContrato;
  salario_min: number | null;
  salario_max: number | null;
  estado: EstadoOferta;
  fecha_publicacion: Date | string;
  fecha_cierre: Date | string | null;
  fecha_actualizacion: Date | string;
  // Campos derivados de JOINs
  empleador?: string;
  categoria?: string | null;
  total_postulaciones?: number;
}

export interface Postulacion {
  id_postulacion: number;
  id_oferta: number;
  id_candidato: number;
  estado: EstadoPostulacion;
  mensaje: string | null;
  fecha_postulacion: Date | string;
  fecha_actualizacion: Date | string;
  // Campos derivados de JOINs
  titulo?: string;
  empresa?: string | null;
  ubicacion?: string;
  candidato?: string;
  candidato_email?: string;
}

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: number | boolean;
  enlace: string | null;
  fecha_creacion: Date | string;
}
