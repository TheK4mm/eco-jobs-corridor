import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza su contenido', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('se deshabilita cuando loading está activo', () => {
    render(<Button loading>Enviar</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
