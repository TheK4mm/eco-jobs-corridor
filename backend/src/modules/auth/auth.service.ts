import * as usersRepo from '../users/users.repository';
import { comparePassword, hashPassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { conflict, notFound, unauthorized } from '../../utils/AppError';
import type { LoginInput, RegisterInput } from './auth.validation';
import type { UsuarioPublico } from '../../types/models';
import type { Rol } from '../../types/common';

export async function register(input: RegisterInput): Promise<UsuarioPublico> {
  if (await usersRepo.emailExists(input.email)) {
    throw conflict('El correo ya está registrado');
  }

  const contrasena_hash = await hashPassword(input.contrasena);
  const id = await usersRepo.create({
    nombre: input.nombre,
    email: input.email,
    contrasena_hash,
    rol: input.rol,
  });

  const user = await usersRepo.findById(id);
  if (!user) throw notFound('No se pudo recuperar el usuario creado');
  return user;
}

export async function login(input: LoginInput): Promise<{ token: string; user: UsuarioPublico }> {
  const user = await usersRepo.findByEmailWithHash(input.email);
  if (!user || !user.contrasena_hash) {
    throw unauthorized('Correo o contraseña incorrectos');
  }

  const passwordOk = await comparePassword(input.contrasena, user.contrasena_hash);
  if (!passwordOk) {
    throw unauthorized('Correo o contraseña incorrectos');
  }
  if (!user.activo) {
    throw unauthorized('Tu cuenta está desactivada. Contacta al administrador.');
  }

  const token = signToken({
    id_usuario: user.id_usuario,
    email: user.email,
    rol: user.rol as Rol,
  });

  const publicUser = await usersRepo.findById(user.id_usuario);
  return { token, user: publicUser as UsuarioPublico };
}

export async function getMe(id: number): Promise<UsuarioPublico> {
  const user = await usersRepo.findById(id);
  if (!user) throw notFound('Usuario no encontrado');
  return user;
}
