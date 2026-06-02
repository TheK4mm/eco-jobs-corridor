import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/db/**', 'src/docs/**', 'src/server.ts'],
    },
    // Las pruebas de integración se ejecutan en serie para no pelear por la BD.
    fileParallelism: false,
  },
});
