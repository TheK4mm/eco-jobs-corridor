# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack job platform ("Plataforma de Empleo — Corredor Ecológico, Villavicencio") connecting candidates and employers. This is a **v2 complete rewrite** (June 2026) from a broken beta. It is a two-package monorepo with **no root `package.json`** — run every command from inside `backend/` or `frontend/`.

**The entire domain is in Spanish** — API routes (`/ofertas`, `/postulaciones`, `/usuarios`), DB columns (`id_usuario`, `titulo`, `estado`), user-facing strings, and code comments. Keep new code consistent with this; do not introduce English identifiers for domain concepts.

## Commands

All commands run from `backend/` or `frontend/` (each installs separately with `npm install`).

### Backend (`cd backend`)
| Command | Action |
|---------|--------|
| `npm run dev` | Dev server with watch (`tsx`), http://localhost:4000 |
| `npm run build` | Compile to `dist/` (`tsconfig.build.json`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm test` | All Vitest tests (integration self-skips if no DB) |
| `npm run test:unit` | Unit tests only (no DB needed) |
| `npm run test:integration` | Integration tests (**requires MySQL**) |
| `npm run db:setup` | Migrate + seed |
| `npm run db:migrate` / `db:seed` / `db:reset` | Migrations / demo data / drop-and-recreate |

### Frontend (`cd frontend`)
`npm run dev` (Vite, :5173) · `npm run build` (typecheck + build) · `npm run typecheck` · `npm run lint` · `npm test`

### Running a single test
`npx vitest run tests/unit/jobs.service.test.ts` (by file) or `npx vitest run -t "substring of test name"`.

## Backend architecture

Express layered by module under `backend/src/modules/<name>/`. Each module is exactly five files with the flow **routes → controller → service → repository**, plus Zod validation:

- **`*.routes.ts`** — wires middleware (`auth`, `authorize(...roles)`, `validate({...})`) to controller handlers. Order matters: literal paths like `/mine` must precede `/:id`.
- **`*.controller.ts`** — thin HTTP layer. Parses the request (`parsePagination`, local `parseFilters`), calls the service, shapes the JSON response. Every handler is wrapped in `asyncHandler` so thrown errors reach the error middleware.
- **`*.service.ts`** — business logic. **Ownership/authorization checks live here, not in middleware** (e.g. `ensureOwnerOrAdmin`). Throws `AppError` helpers. Orchestrates transactions.
- **`*.repository.ts`** — the only place that touches SQL. Hand-written, **always parameterized** (`?`) — there is no ORM.
- **`*.validation.ts`** — Zod schemas; the inferred types are reused as the service input types.

Modules: `auth, users, profiles, jobs, applications, notifications, categories, admin`. App assembly (middleware, route mounting) is in `src/app.ts`; startup in `src/server.ts`. API base is `/api/v1`; Swagger UI at `/api/docs`.

### Cross-cutting conventions
- **Data access** — use the helpers in `src/config/db.ts`: `query<T>()` for SELECT, `execute()` for INSERT/UPDATE/DELETE, `withTransaction(fn)` for atomic multi-writes. For atomic operations, pass the transaction `conn` down into repository functions (see `applications.service.ts`: a postulación and its notification are created in one transaction).
- **Errors** — throw `AppError` helpers from `src/utils/AppError.ts` (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`) anywhere in services/middleware; the central `errorHandler` formats the response. Don't write ad-hoc `res.status(...).json(...)` for errors.
- **Auth** — `auth` middleware validates the `Bearer` JWT and attaches `req.user` (`AuthPayload`: `id_usuario`, `rol`, `email`). `authorize(...roles)` gates by role. Finer-grained ownership is checked in the service.
- **Config** — `src/config/env.ts` validates all env vars with Zod at boot and **`process.exit(1)` on failure** (fail fast). Import the typed `config` object; never read `process.env` directly elsewhere.
- **Validation** — the `validate` middleware mutates `req.query`/`req.params` in place (Express getters can't be reassigned) and replaces `req.body` with the parsed value.

### Deliberate version choices (do not "upgrade")
- **Express 4**, not 5 — stability.
- **bcryptjs**, not native `bcrypt` — avoids native compilation on Windows.

## Frontend architecture

React 18 + Vite + Tailwind (green visual identity). Path alias **`@/` → `src/`**.

- **`src/api/`** — Axios client (`client.ts`) plus one service file per module. The client interceptors attach the JWT to every request and, on any `401`, clear the token and dispatch a global `auth:logout` event. JWT is stored in `localStorage` under `corredor_token`.
- **Server state** is TanStack Query; **forms** use React Hook Form + Zod (`@hookform/resolvers`).
- **`src/context/`** — `AuthProvider` holds the session.
- **Routing** (`src/App.tsx`) is guarded by `<ProtectedRoute>` (requires session) nested with `<RoleRoute roles={[...]}>` (RBAC). Page folders mirror roles: `pages/candidate/`, `pages/employer/`, `pages/admin/`.

## Database & local environment

MySQL/MariaDB via **XAMPP** on Windows. **Use `DB_HOST=127.0.0.1`** (not `localhost`) to avoid socket issues — the XAMPP data dir was recovered on 2026-06-02. Schema is normalized (3NF); source of truth is `src/db/schema.sql` with ordered migrations in `src/db/migrations/`. Backend won't boot without a valid `.env` (copy `backend/.env.example`); `JWT_SECRET` must be ≥32 chars.

**Integration tests use a separate database** (`DB_NAME_TEST`, default `corredor_empleo_test`, active only when `NODE_ENV=test`) and **`resetDatabase()` drops and recreates it** in `beforeAll`. If MySQL is unreachable they degrade gracefully — `dbAvailable` stays false and each test calls `ctx.skip()` rather than failing. Unit tests need no database.

## Additional docs
`docs/ARQUITECTURA.md` (layers, request flow, security), `docs/BASE_DE_DATOS.md` (ER model), `docs/API.md` (endpoint reference).
