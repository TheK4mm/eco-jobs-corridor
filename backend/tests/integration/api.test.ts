import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { resetDatabase } from '../../src/db/reset';
import { createApp } from '../../src/app';
import { closePool } from '../../src/config/db';

let app: Express | undefined;
let dbAvailable = false;

beforeAll(async () => {
  try {
    await resetDatabase(); // recrea la BD de pruebas + datos demo
    app = createApp();
    dbAvailable = true;
  } catch (error) {
    console.warn(
      '\n⚠ Pruebas de integración OMITIDAS: no se pudo conectar a MySQL.\n  ' +
        (error instanceof Error ? error.message : String(error)) +
        '\n  Inicia MySQL (XAMPP) y ejecuta de nuevo `npm run test:integration`.\n',
    );
  }
}, 60_000);

afterAll(async () => {
  if (dbAvailable) await closePool();
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@corredorempleo.co';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234*';

describe('API de la plataforma (integración)', () => {
  it('GET /health responde ok y la BD está conectada', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const res = await request(app!).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.db).toBe(true);
  });

  it('GET /ofertas devuelve ofertas activas sin autenticación', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const res = await request(app!).get('/api/v1/ofertas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('el admin sembrado puede iniciar sesión', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const res = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, contrasena: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf('string');
    expect(res.body.refreshToken).toBeTypeOf('string');
  });

  it('refresh rota el token y el anterior queda inutilizable (detección de reuso)', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const login = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, contrasena: ADMIN_PASSWORD });
    const oldRefresh = login.body.refreshToken as string;

    const rotated = await request(app!)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefresh });
    expect(rotated.status).toBe(200);
    expect(rotated.body.accessToken).toBeTypeOf('string');
    expect(rotated.body.refreshToken).not.toBe(oldRefresh);

    // Reusar el refresh viejo (ya rotado) debe fallar.
    const reused = await request(app!)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefresh });
    expect(reused.status).toBe(401);
  });

  it('rechaza el registro con rol admin (sin escalada de privilegios)', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const res = await request(app!)
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Intruso',
        email: `hack_${Date.now()}@x.com`,
        contrasena: 'Clave123',
        rol: 'admin',
      });
    expect(res.status).toBe(400);
  });

  it('bloquea rutas protegidas sin token', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const res = await request(app!).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('flujo candidato: registro → login → postulación (y evita duplicados)', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const email = `cand_${Date.now()}@example.com`;

    const reg = await request(app!)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Candidato Test', email, contrasena: 'Clave123' });
    expect(reg.status).toBe(201);

    const login = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email, contrasena: 'Clave123' });
    expect(login.status).toBe(200);
    const token = login.body.accessToken as string;

    const ofertas = await request(app!).get('/api/v1/ofertas');
    const ofertaId = ofertas.body.data[0].id_oferta as number;

    const postulacion = await request(app!)
      .post('/api/v1/postulaciones')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_oferta: ofertaId, mensaje: 'Me interesa mucho' });
    expect(postulacion.status).toBe(201);

    const duplicada = await request(app!)
      .post('/api/v1/postulaciones')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_oferta: ofertaId });
    expect(duplicada.status).toBe(409);
  });

  it('empleos guardados: guardar, listar ids y quitar', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const email = `save_${Date.now()}@example.com`;
    await request(app!)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Guarda', email, contrasena: 'Clave123' });
    const login = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email, contrasena: 'Clave123' });
    const token = login.body.accessToken as string;
    const ofertas = await request(app!).get('/api/v1/ofertas');
    const ofertaId = ofertas.body.data[0].id_oferta as number;

    const guardar = await request(app!)
      .post(`/api/v1/guardados/${ofertaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(guardar.status).toBe(201);

    const ids = await request(app!)
      .get('/api/v1/guardados/ids')
      .set('Authorization', `Bearer ${token}`);
    expect(ids.body.ids).toContain(ofertaId);

    const quitar = await request(app!)
      .delete(`/api/v1/guardados/${ofertaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(quitar.status).toBe(200);
  });

  it('recuperación de contraseña: forgot → reset → login con la nueva clave', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const email = `reset_${Date.now()}@example.com`;
    await request(app!)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Reseteo', email, contrasena: 'Clave123' });

    const forgot = await request(app!).post('/api/v1/auth/forgot-password').send({ email });
    expect(forgot.status).toBe(200);
    const resetToken = forgot.body.resetToken as string; // expuesto fuera de producción
    expect(resetToken).toBeTypeOf('string');

    const reset = await request(app!)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, contrasena: 'NuevaClave9' });
    expect(reset.status).toBe(200);

    const relogin = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email, contrasena: 'NuevaClave9' });
    expect(relogin.status).toBe(200);
  });

  it('mensajería: candidato y empleador intercambian mensajes en una postulación', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    // El empleador sembrado es dueño de las ofertas demo.
    const empLogin = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email: 'empleador@corredorempleo.co', contrasena: 'Empleador123*' });
    const empToken = empLogin.body.accessToken as string;

    const email = `msg_${Date.now()}@example.com`;
    await request(app!)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Mensajero', email, contrasena: 'Clave123' });
    const candLogin = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email, contrasena: 'Clave123' });
    const candToken = candLogin.body.accessToken as string;

    const ofertas = await request(app!).get('/api/v1/ofertas');
    const ofertaId = ofertas.body.data[0].id_oferta as number;
    const postulacion = await request(app!)
      .post('/api/v1/postulaciones')
      .set('Authorization', `Bearer ${candToken}`)
      .send({ id_oferta: ofertaId });
    const postId = postulacion.body.postulacion.id_postulacion as number;

    const enviado = await request(app!)
      .post(`/api/v1/mensajes/${postId}`)
      .set('Authorization', `Bearer ${candToken}`)
      .send({ cuerpo: 'Hola, ¿sigue disponible la vacante?' });
    expect(enviado.status).toBe(201);

    // El empleador dueño puede leer la conversación.
    const conv = await request(app!)
      .get(`/api/v1/mensajes/${postId}`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(conv.status).toBe(200);
    expect(conv.body.mensajes.length).toBeGreaterThan(0);

    // Un tercero sin relación no puede acceder.
    const otroEmail = `otro_${Date.now()}@example.com`;
    await request(app!)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Otro', email: otroEmail, contrasena: 'Clave123' });
    const otroLogin = await request(app!)
      .post('/api/v1/auth/login')
      .send({ email: otroEmail, contrasena: 'Clave123' });
    const ajeno = await request(app!)
      .get(`/api/v1/mensajes/${postId}`)
      .set('Authorization', `Bearer ${otroLogin.body.accessToken as string}`);
    expect(ajeno.status).toBe(403);
  });
});
