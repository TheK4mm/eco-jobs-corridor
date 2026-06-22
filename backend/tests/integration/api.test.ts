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
});
