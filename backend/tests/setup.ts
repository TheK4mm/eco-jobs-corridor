/**
 * Configuración previa a las pruebas: define variables de entorno válidas para
 * que `src/config/env.ts` no aborte el proceso. Se ejecuta antes de importar
 * cualquier módulo de la aplicación (vitest setupFiles).
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'secreto_de_pruebas_unitarias_con_mas_de_32_caracteres';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '3306';
process.env.DB_USER = process.env.DB_USER ?? 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? '';
process.env.DB_NAME = process.env.DB_NAME ?? 'corredor_empleo';
process.env.DB_NAME_TEST = process.env.DB_NAME_TEST ?? 'corredor_empleo_test';
