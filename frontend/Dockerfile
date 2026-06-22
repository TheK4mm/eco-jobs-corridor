# syntax=docker/dockerfile:1

# ─── Etapa de build ──────────────────────────────────────────
# Vite inyecta VITE_API_URL en tiempo de build. Por defecto usa una
# ruta relativa (/api/v1) que nginx redirige al backend (ver nginx.conf).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ─── Etapa de runtime (nginx estático) ───────────────────────
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
