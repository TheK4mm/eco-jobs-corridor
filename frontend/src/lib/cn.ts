import clsx, { type ClassValue } from 'clsx';

/** Une clases condicionales de Tailwind de forma segura. */
export const cn = (...inputs: ClassValue[]): string => clsx(inputs);
