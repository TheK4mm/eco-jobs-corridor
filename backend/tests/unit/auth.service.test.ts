import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as usersRepo from '../../src/modules/users/users.repository';
import * as authService from '../../src/modules/auth/auth.service';
import { hashPassword } from '../../src/utils/password';
import type { UsuarioPublico } from '../../src/types/models';

vi.mock('../../src/modules/users/users.repository');

const fakeUser: UsuarioPublico = {
  id_usuario: 1,
  nombre: 'Laura',
  email: 'laura@example.com',
  rol: 'candidato',
  id_rol: 3,
  activo: 1,
  fecha_registro: '2026-01-01',
  fecha_actualizacion: '2026-01-01',
};

describe('auth.service', () => {
  beforeEach(() => vi.resetAllMocks());

  it('register crea el usuario cuando el email no existe', async () => {
    vi.mocked(usersRepo.emailExists).mockResolvedValue(false);
    vi.mocked(usersRepo.create).mockResolvedValue(1);
    vi.mocked(usersRepo.findById).mockResolvedValue(fakeUser);

    const user = await authService.register({
      nombre: 'Laura',
      email: 'laura@example.com',
      contrasena: 'Clave123',
      rol: 'candidato',
    });

    expect(user.email).toBe('laura@example.com');
    expect(usersRepo.create).toHaveBeenCalledOnce();
  });

  it('register lanza 409 si el email ya está registrado', async () => {
    vi.mocked(usersRepo.emailExists).mockResolvedValue(true);
    await expect(
      authService.register({
        nombre: 'Laura',
        email: 'laura@example.com',
        contrasena: 'Clave123',
        rol: 'candidato',
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('login devuelve token con credenciales válidas', async () => {
    const hash = await hashPassword('Clave123');
    vi.mocked(usersRepo.findByEmailWithHash).mockResolvedValue({
      ...fakeUser,
      contrasena_hash: hash,
    });
    vi.mocked(usersRepo.findById).mockResolvedValue(fakeUser);

    const result = await authService.login({ email: 'laura@example.com', contrasena: 'Clave123' });
    expect(result.token).toBeTypeOf('string');
    expect(result.user.email).toBe('laura@example.com');
  });

  it('login lanza 401 con contraseña incorrecta', async () => {
    const hash = await hashPassword('Clave123');
    vi.mocked(usersRepo.findByEmailWithHash).mockResolvedValue({
      ...fakeUser,
      contrasena_hash: hash,
    });
    await expect(
      authService.login({ email: 'laura@example.com', contrasena: 'incorrecta' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('login lanza 401 si el usuario no existe', async () => {
    vi.mocked(usersRepo.findByEmailWithHash).mockResolvedValue(null);
    await expect(
      authService.login({ email: 'nadie@example.com', contrasena: 'x' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
