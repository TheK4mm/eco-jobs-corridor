import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as usersRepo from '../../src/modules/users/users.repository';
import * as authRepo from '../../src/modules/auth/auth.repository';
import * as authService from '../../src/modules/auth/auth.service';
import { hashPassword } from '../../src/utils/password';
import type { UsuarioPublico } from '../../src/types/models';

vi.mock('../../src/modules/users/users.repository');
vi.mock('../../src/modules/auth/auth.repository');

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

  it('login devuelve access + refresh token con credenciales válidas', async () => {
    const hash = await hashPassword('Clave123');
    vi.mocked(usersRepo.findByEmailWithHash).mockResolvedValue({
      ...fakeUser,
      contrasena_hash: hash,
    });
    vi.mocked(usersRepo.findById).mockResolvedValue(fakeUser);
    vi.mocked(authRepo.createSession).mockResolvedValue(1);

    const result = await authService.login({ email: 'laura@example.com', contrasena: 'Clave123' });
    expect(result.accessToken).toBeTypeOf('string');
    expect(result.refreshToken).toBeTypeOf('string');
    expect(result.user.email).toBe('laura@example.com');
    expect(authRepo.createSession).toHaveBeenCalledOnce();
  });

  it('login bloquea la cuenta tras varios intentos fallidos', async () => {
    const hash = await hashPassword('Clave123');
    vi.mocked(usersRepo.findByEmailWithHash).mockResolvedValue({
      ...fakeUser,
      contrasena_hash: hash,
      intentos_fallidos: 4,
    });

    await expect(
      authService.login({ email: 'laura@example.com', contrasena: 'incorrecta' }),
    ).rejects.toMatchObject({ statusCode: 401 });
    // Al 5º intento fallido se registra el bloqueo (intentos_fallidos = 5).
    expect(usersRepo.updateLockState).toHaveBeenCalledWith(1, 5, expect.any(Date));
  });

  it('login responde 429 si la cuenta está bloqueada', async () => {
    const hash = await hashPassword('Clave123');
    vi.mocked(usersRepo.findByEmailWithHash).mockResolvedValue({
      ...fakeUser,
      contrasena_hash: hash,
      bloqueado_hasta: new Date(Date.now() + 60_000),
    });

    await expect(
      authService.login({ email: 'laura@example.com', contrasena: 'Clave123' }),
    ).rejects.toMatchObject({ statusCode: 429 });
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
