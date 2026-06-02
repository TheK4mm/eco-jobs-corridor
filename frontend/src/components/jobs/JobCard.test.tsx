import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { JobCard } from './JobCard';
import type { Oferta } from '@/types';

const oferta: Oferta = {
  id_oferta: 1,
  id_empleador: 2,
  id_categoria: null,
  titulo: 'Guía Turístico',
  descripcion: 'Acompañamiento de turistas en recorridos.',
  empresa: 'EcoTurismo',
  ubicacion: 'Villavicencio',
  modalidad: 'presencial',
  tipo_contrato: 'tiempo_completo',
  salario_min: 1_000_000,
  salario_max: 2_000_000,
  estado: 'activa',
  fecha_publicacion: '2026-01-01',
  fecha_cierre: null,
  fecha_actualizacion: '2026-01-01',
};

describe('JobCard', () => {
  it('muestra título, empresa y modalidad', () => {
    render(
      <MemoryRouter>
        <JobCard oferta={oferta} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Guía Turístico')).toBeInTheDocument();
    expect(screen.getByText('EcoTurismo')).toBeInTheDocument();
    expect(screen.getByText('Presencial')).toBeInTheDocument();
    expect(screen.getByText('Tiempo completo')).toBeInTheDocument();
  });

  it('enlaza al detalle de la oferta', () => {
    render(
      <MemoryRouter>
        <JobCard oferta={oferta} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Guía Turístico' })).toHaveAttribute(
      'href',
      '/ofertas/1',
    );
  });
});
