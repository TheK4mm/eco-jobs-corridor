import 'dotenv/config';
import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno.
 * La aplicación NO arranca si la configuración es inválida (falla rápido).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),

  DB_HOST: z.string().min(1, 'DB_HOST es obligatorio'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1, 'DB_USER es obligatorio'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1, 'DB_NAME es obligatorio'),
  DB_NAME_TEST: z.string().optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  // Vigencia del access token (corto, porque hay refresh token con rotación).
  JWT_EXPIRES_IN: z.string().default('15m'),
  // Vigencia del refresh token, en días.
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().max(90).default(7),
  // URL pública del frontend (para construir enlaces de recuperación, etc.).
  APP_URL: z.string().url().default('http://localhost:5173'),

  ADMIN_NAME: z.string().default('Administrador'),
  ADMIN_EMAIL: z.string().email().default('admin@corredorempleo.co'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin1234*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Variables de entorno inválidas. Revisa tu archivo .env:\n');
  for (const [key, errors] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(`   - ${key}: ${errors?.join(', ')}`);
  }
  console.error('\nSugerencia: copia backend/.env.example a backend/.env y complétalo.\n');
  process.exit(1);
}

const env = parsed.data;
const useTestDb = env.NODE_ENV === 'test' && !!env.DB_NAME_TEST;

export const config = {
  nodeEnv: env.NODE_ENV,
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  isDev: env.NODE_ENV === 'development',
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  corsOrigins: env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: useTestDb ? (env.DB_NAME_TEST as string) : env.DB_NAME,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshTokenDays: env.REFRESH_TOKEN_DAYS,
  },
  appUrl: env.APP_URL,
  admin: {
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  },
} as const;

export type AppConfig = typeof config;
