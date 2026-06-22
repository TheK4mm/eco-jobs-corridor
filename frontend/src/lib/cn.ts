import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Une clases condicionales de Tailwind de forma segura, resolviendo conflictos:
 * la última clase gana (p. ej. un `className` puede sobrescribir la variante).
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
