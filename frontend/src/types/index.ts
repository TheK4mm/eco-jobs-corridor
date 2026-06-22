export type Rol = 'admin' | 'empleador' | 'candidato';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: Rol;
  id_rol: number;
  activo: number | boolean;
  fecha_registro: string;
  fecha_actualizacion: string;
}

export type Modalidad = 'presencial' | 'remoto' | 'hibrido';
export type TipoContrato =
  | 'tiempo_completo'
  | 'medio_tiempo'
  | 'temporal'
  | 'practica'
  | 'freelance';
export type EstadoOferta = 'activa' | 'cerrada' | 'borrador';
export type EstadoPostulacion =
  | 'enviada'
  | 'en_revision'
  | 'preseleccionado'
  | 'rechazado'
  | 'aceptado';

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
  fecha_publicacion: string;
  fecha_cierre: string | null;
  fecha_actualizacion: string;
  empleador?: string;
  categoria?: string | null;
}

export interface Postulacion {
  id_postulacion: number;
  id_oferta: number;
  id_candidato: number;
  estado: EstadoPostulacion;
  mensaje: string | null;
  fecha_postulacion: string;
  fecha_actualizacion: string;
  titulo?: string;
  empresa?: string | null;
  ubicacion?: string;
  candidato?: string;
  candidato_email?: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Alerta {
  id_alerta: number;
  id_usuario: number;
  palabra_clave: string | null;
  id_categoria: number | null;
  categoria: string | null;
  modalidad: Modalidad | null;
  activa: number | boolean;
  fecha_creacion: string;
}

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: number | boolean;
  enlace: string | null;
  fecha_creacion: string;
}

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

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminStats {
  usuarios: { total: number; por_rol: Array<{ rol: string; total: number }> };
  ofertas: { total: number; por_estado: Array<{ estado: string; total: number }> };
  postulaciones: { total: number; por_estado: Array<{ estado: string; total: number }> };
}
