import { describe, expect, it } from 'vitest';
import { ESTADO_POSTULACION_LABEL, formatSalary } from './format';

describe('formatSalary', () => {
  it('devuelve "a convenir" cuando no hay valores', () => {
    expect(formatSalary(null, null)).toBe('Salario a convenir');
  });

  it('muestra un rango cuando hay mínimo y máximo', () => {
    expect(formatSalary(1_000_000, 2_000_000)).toContain('–');
  });

  it('muestra un único valor cuando solo hay mínimo', () => {
    expect(formatSalary(1_000_000, null)).not.toContain('–');
  });
});

describe('etiquetas de estado', () => {
  it('traduce los estados de postulación', () => {
    expect(ESTADO_POSTULACION_LABEL.aceptado).toBe('Aceptada');
    expect(ESTADO_POSTULACION_LABEL.en_revision).toBe('En revisión');
  });
});
