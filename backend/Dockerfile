# syntax=docker/dockerfile:1

# ─── Etapa de build ──────────────────────────────────────────
# Compila TypeScript a dist/ y copia los .sql de migraciones
# dentro de dist/db/migrations (migrate.ts los resuelve por __dirname).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && cp -r src/db/migrations dist/db/migrations

# ─── Etapa de runtime ────────────────────────────────────────
# Imagen final mínima: solo dependencias de producción + dist/.
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# Healthcheck contra el endpoint /health del propio servicio.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1

EXPOSE 4000
USER node
CMD ["node", "dist/server.js"]
