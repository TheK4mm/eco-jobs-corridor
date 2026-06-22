/**
 * Fuente ÚNICA de verdad para los enumerados del dominio.
 *
 * Estos arreglos `as const` se reutilizan en:
 *  - Validación Zod (`z.enum(...)`) en los `*.validation.ts`.
 *  - Tipos del dominio (`src/types/*`), derivados con `(typeof X)[number]`.
 *  - El esquema SQL (los `ENUM(...)` deben mantenerse alineados con estos valores).
 *
 * Antes estaban duplicados en validaciones y tipos; centralizarlos evita que se
 * desincronicen al añadir o renombrar valores.
 */

/** Roles del sistema. */
export const ROLES = ['admin', 'empleador', 'candidato'] as const;
export type Rol = (typeof ROLES)[number];

/**
 * Roles que un usuario puede asignarse en el registro público.
 * 'admin' queda excluido a propósito para evitar escalada de privilegios.
 */
export const ROLES_REGISTRO = ['candidato', 'empleador'] as const;
export type RolRegistro = (typeof ROLES_REGISTRO)[number];

/** Modalidad de trabajo de una oferta. */
export const MODALIDADES = ['presencial', 'remoto', 'hibrido'] as const;
export type Modalidad = (typeof MODALIDADES)[number];

/** Tipo de contrato de una oferta. */
export const TIPOS_CONTRATO = [
  'tiempo_completo',
  'medio_tiempo',
  'temporal',
  'practica',
  'freelance',
] as const;
export type TipoContrato = (typeof TIPOS_CONTRATO)[number];

/** Estado del ciclo de vida de una oferta. */
export const ESTADOS_OFERTA = ['activa', 'cerrada', 'borrador'] as const;
export type EstadoOferta = (typeof ESTADOS_OFERTA)[number];

/** Estado del ciclo de vida de una postulación. */
export const ESTADOS_POSTULACION = [
  'enviada',
  'en_revision',
  'preseleccionado',
  'rechazado',
  'aceptado',
] as const;
export type EstadoPostulacion = (typeof ESTADOS_POSTULACION)[number];
