# Plataforma de Empleo — Corredor Ecológico (Villavicencio)

Aplicación web full‑stack que conecta a candidatos y empleadores del **Corredor
Ecológico de Villavicencio – Meta**, permitiendo publicar ofertas, postularse,
gestionar procesos de contratación y administrar la plataforma.

Versión **2.0** — reescritura completa, profesional, segura y lista para producción.

---

## Características

- **Autenticación y roles** (candidato, empleador, admin) con JWT y contraseñas hasheadas.
- **Ofertas de empleo**: CRUD completo, **búsqueda y filtros** (palabra clave, categoría, ubicación, modalidad, tipo de contrato) y **paginación**.
- **Postulaciones** con **estados** (enviada, en revisión, preseleccionado, rechazado, aceptado).
- **Perfiles** de candidato (con habilidades) y de empleador (empresa).
- **Notificaciones in‑app** automáticas (nueva postulación, cambios de estado).
- **Panel administrativo**: métricas, gestión de usuarios, ofertas y categorías.
- **Validación de formularios** en cliente (Zod + React Hook Form) y servidor (Zod).
- **Seguridad**: Helmet, CORS configurable, rate limiting, RBAC y verificación de propiedad.
- **Interfaz moderna, responsive y accesible** con identidad visual verde (Tailwind CSS).
- **API REST documentada** con Swagger UI.

---

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS · React Router · TanStack Query · React Hook Form · Zod |
| **Backend** | Node.js · Express · TypeScript · arquitectura por capas (rutas → controlador → servicio → repositorio) |
| **Base de datos** | MySQL / MariaDB (`mysql2`, SQL parametrizado, esquema normalizado 3FN) |
| **Auth / Seguridad** | JWT · bcryptjs · Helmet · CORS · express-rate-limit |
| **Pruebas** | Vitest · Supertest · Testing Library |
| **Docs** | Swagger UI (OpenAPI 3) |

---

## Estructura del proyecto

```
employment-web-platform/
├── backend/                 # API REST (Express + TypeScript)
│   ├── src/
│   │   ├── config/          # env (validación con Zod) y pool MySQL
│   │   ├── db/              # schema.sql, migraciones, seed, runner
│   │   ├── middleware/      # auth, authorize (RBAC), validate, errores
│   │   ├── modules/         # auth, users, profiles, jobs, applications,
│   │   │                    #   notifications, categories, admin
│   │   │                    #   (routes · controller · service · repository · validation)
│   │   ├── utils/           # AppError, jwt, password, paginación
│   │   ├── docs/            # especificación OpenAPI
│   │   ├── app.ts           # ensamblado de Express
│   │   └── server.ts        # arranque
│   └── tests/               # unitarias (mock) + integración (Supertest)
├── frontend/                # SPA (React + Vite + Tailwind)
│   └── src/
│       ├── api/             # cliente axios + servicios por módulo
│       ├── components/      # ui/, layout/, jobs/, profiles/, applications/
│       ├── context/         # AuthProvider
│       ├── pages/           # públicas, candidato/, empleador/, admin/
│       └── lib/             # utilidades (formato, cn)
├── docs/                    # ARQUITECTURA · BASE_DE_DATOS · API
└── README.md
```

---

## Requisitos previos

- **Node.js 18+** y npm
- **MySQL o MariaDB** corriendo en `localhost:3306` (se recomienda **XAMPP** en Windows)

> En XAMPP basta con iniciar el módulo **MySQL** desde el panel de control. No se
> necesita crear la base de datos manualmente: el script de migración la crea.

---

## Instalación y configuración

### 1) Clonar e instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

### 2) Variables de entorno

**Backend** — copia el ejemplo y ajústalo:

```bash
cd backend
cp .env.example .env
```

Valores por defecto (XAMPP, usuario `root` sin contraseña):

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=corredor_empleo
JWT_SECRET=cambia_esto_por_un_secreto_de_32+_caracteres
CORS_ORIGIN=http://localhost:5173
```

> Genera un secreto seguro con:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**Frontend** — opcional (ya trae un valor por defecto):

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api/v1
```

### 3) Crear la base de datos y datos de ejemplo

Con **MySQL en ejecución**, desde `backend/`:

```bash
npm run db:setup       # ejecuta migraciones + datos de ejemplo
```

Otros comandos útiles:

| Comando | Acción |
|---------|--------|
| `npm run db:migrate` | Aplica migraciones pendientes (crea la BD si no existe) |
| `npm run db:seed`    | Inserta admin + datos demo |
| `npm run db:reset`   | ⚠ Elimina y recrea la BD (migraciones + seed) |

> Alternativa manual: importar `backend/src/db/schema.sql` desde **phpMyAdmin**.

### 4) Ejecutar en desarrollo

```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

Abre **http://localhost:5173**. La documentación de la API está en
**http://localhost:4000/api/docs**.

---

## Credenciales de ejemplo (tras `db:seed`)

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@corredorempleo.co` | `Admin1234*` |
| Empleador | `empleador@corredorempleo.co` | `Empleador123*` |
| Candidato | `candidato@corredorempleo.co` | `Candidato123*` |

---

## Pruebas

```bash
# Backend — unitarias (no requieren BD) + integración (requieren MySQL)
cd backend
npm test                 # todo (integración se omite si no hay BD)
npm run test:unit        # solo unitarias
npm run test:integration # solo integración (necesita MySQL en ejecución)

# Frontend — componentes y utilidades
cd frontend
npm test
```

Calidad de código:

```bash
npm run typecheck   # verificación de tipos (backend y frontend)
npm run lint        # ESLint
npm run build       # compilación de producción
```

---

## Visión general de la API

Base: `http://localhost:4000/api/v1` — documentación interactiva en `/api/docs`.

| Recurso | Endpoints destacados |
|---------|----------------------|
| **Auth** | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` |
| **Ofertas** | `GET /ofertas` (público, filtros) · `GET /ofertas/:id` · `POST/PATCH/DELETE /ofertas/:id` · `GET /ofertas/mine` · `GET /ofertas/:id/applications` |
| **Postulaciones** | `POST /postulaciones` · `GET /postulaciones/mine` · `PATCH /postulaciones/:id/status` · `DELETE /postulaciones/:id` |
| **Perfiles** | `GET/PUT /perfiles/candidate/me` · `GET/PUT /perfiles/employer/me` · `GET /perfiles/habilidades` |
| **Notificaciones** | `GET /notificaciones` · `GET /notificaciones/unread-count` · `PATCH /notificaciones/:id/read` |
| **Categorías** | `GET /categorias` · CRUD admin |
| **Admin** | `GET /admin/stats` · `GET /admin/ofertas` · `GET /usuarios` (gestión) |

Detalle completo en [`docs/API.md`](docs/API.md).

---

## 🚢 Despliegue (resumen)

1. **Base de datos**: aprovisiona MySQL/MariaDB y configura las variables `DB_*`.
2. **Backend**: `npm run build` y ejecuta `npm start` (sirve `dist/`). Define
   `NODE_ENV=production`, un `JWT_SECRET` fuerte y `CORS_ORIGIN` con el dominio real.
   Ejecuta `npm run db:migrate` en el servidor.
3. **Frontend**: `npm run build` genera `dist/` (estáticos) que puedes servir en
   Netlify, Vercel, Nginx, etc. Configura `VITE_API_URL` apuntando a la API.

---

## Documentación adicional

- [Arquitectura](docs/ARQUITECTURA.md) — capas, flujo de petición, SOLID y seguridad.
- [Base de datos](docs/BASE_DE_DATOS.md) — modelo entidad‑relación y normalización.
- [Referencia de API](docs/API.md) — endpoints, parámetros y permisos.

---

## Solución de problemas

| Problema | Causa probable / solución |
|----------|---------------------------|
| `db: false` en `/health` o error 503 | MySQL no está activo. Inicia el módulo MySQL en XAMPP. |
| `Variables de entorno inválidas` al arrancar | Falta `.env` o `JWT_SECRET` (mínimo 32 caracteres). |
| `ER_ACCESS_DENIED_ERROR` | Usuario/contraseña de `DB_*` incorrectos. |
| CORS bloqueado en el navegador | Ajusta `CORS_ORIGIN` con la URL del frontend. |

---
