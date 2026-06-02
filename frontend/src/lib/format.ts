import type { EstadoOferta, EstadoPostulacion, Modalidad, TipoContrato } from '@/types';

export const formatDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatCurrency = (value: number | null): string =>
  value == null
    ? ''
    : new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value);

export const formatSalary = (min: number | null, max: number | null): string => {
  if (min == null && max == null) return 'Salario a convenir';
  if (min != null && max != null) return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  return formatCurrency(min ?? max);
};

export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

export const CONTRATO_LABEL: Record<TipoContrato, string> = {
  tiempo_completo: 'Tiempo completo',
  medio_tiempo: 'Medio tiempo',
  temporal: 'Temporal',
  practica: 'Práctica',
  freelance: 'Freelance',
};

export const ESTADO_OFERTA_LABEL: Record<EstadoOferta, string> = {
  activa: 'Activa',
  cerrada: 'Cerrada',
  borrador: 'Borrador',
};

export const ESTADO_POSTULACION_LABEL: Record<EstadoPostulacion, string> = {
  enviada: 'Enviada',
  en_revision: 'En revisión',
  preseleccionado: 'Preseleccionado',
  rechazado: 'Rechazada',
  aceptado: 'Aceptada',
};

export const ESTADO_POSTULACION_COLOR: Record<EstadoPostulacion, string> = {
  enviada: 'bg-gray-100 text-gray-700',
  en_revision: 'bg-blue-100 text-blue-700',
  preseleccionado: 'bg-amber-100 text-amber-800',
  rechazado: 'bg-red-100 text-red-700',
  aceptado: 'bg-brand-100 text-brand-800',
};

export const ESTADO_OFERTA_COLOR: Record<EstadoOferta, string> = {
  activa: 'bg-brand-100 text-brand-800',
  cerrada: 'bg-gray-100 text-gray-600',
  borrador: 'bg-amber-100 text-amber-800',
};
