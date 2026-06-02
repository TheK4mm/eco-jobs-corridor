import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from '../../src/utils/password';

describe('utils/password', () => {
  it('genera un hash distinto al texto plano y lo verifica', async () => {
    const hash = await hashPassword('Secreta123');
    expect(hash).not.toBe('Secreta123');
    expect(await comparePassword('Secreta123', hash)).toBe(true);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const hash = await hashPassword('Secreta123');
    expect(await comparePassword('Equivocada', hash)).toBe(false);
  });
});
