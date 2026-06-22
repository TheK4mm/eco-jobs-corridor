# Arquitectura

## Visión general

Aplicación full‑stack desacoplada:

```
┌──────────────┐      HTTP/JSON (REST)      ┌──────────────┐      SQL      ┌──────────┐
│   Frontend   │  ───────────────────────▶  │   Backend    │  ──────────▶  │  MySQL   │
│ React + Vite │  ◀───────────────────────  │  Express API │  ◀──────────  │ MariaDB  │
└──────────────┘        JWT (Bearer)         └──────────────┘               └──────────┘
```

- **Frontend (SPA)**: consume la API con axios; estado de servidor con TanStack Query;
  enrutamiento con React Router; sesión con JWT en `localStorage`.
- **Backend (API REST)**: Express con arquitectura por capas y middlewares de seguridad.
- **Base de datos**: MySQL/MariaDB con acceso vía `mysql2` y SQL parametrizado.

## Backend — arquitectura por capas (SOLID)

Cada módulo de negocio (`auth`, `users`, `profiles`, `jobs`, `applications`,
`notifications`, `categories`, `admin`, `audit`, `saved-jobs`, `alerts`, `email`,
`messages`) sigue la misma separación de responsabilidades:

```
routes  →  middleware (auth · authorize · validate)  →  controller  →  service  →  repository  →  MySQL
```

| Capa | Responsabilidad |
|------|-----------------|
| **routes** | Define endpoints y encadena middlewares (autenticación, RBAC, validación). |
| **middleware** | Verifica JWT (`auth`), aplica roles (`authorize`), valida entrada con Zod (`validate`). |
| **controller** | Orquesta `req`/`res`; delega en el servicio; nunca contiene SQL. |
| **service** | Reglas de negocio, autorización fina (propiedad), transacciones. |
| **repository** | Único punto con SQL (siempre parametrizado); devuelve tipos del dominio. |

### Flujo de una petición (ejemplo: crear postulación)

1. `POST /api/v1/postulaciones` → `applications.routes`
2. `auth` valida el JWT y adjunta `req.user`.
3. `authorize('candidato','admin')` comprueba el rol.
4. `validate({ body })` valida con Zod.
5. `applications.controller.apply` llama al servicio.
6. `applications.service.apply` valida reglas (oferta activa, no duplicado), abre una
   **transacción** y crea la postulación **+** una notificación al empleador.
7. `applications.repository` ejecuta el SQL.
8. Respuesta JSON uniforme; los errores fluyen al **middleware central**.

### Principios aplicados

- **SRP**: cada archivo tiene una única razón de cambio (validación, negocio, datos…).
- **DIP / inversión**: los servicios dependen de funciones de repositorio (mockeables en tests).
- **DRY**: un único middleware `auth` (antes estaba duplicado en cada ruta).
- **Manejo de errores centralizado**: `HttpError` + `errorHandler` → respuestas consistentes,
  sin filtrar *stack traces* en producción; traduce errores de MySQL (p. ej. duplicados → 409).
- **Configuración validada**: `config/env.ts` valida variables con Zod y **falla rápido**.

## Seguridad

| Riesgo | Mitigación |
|--------|------------|
| Escalada de privilegios en registro | El registro público solo acepta `candidato`/`empleador` (Zod). |
| Contraseñas | Hash con bcrypt; el hash nunca se serializa a la API. |
| Acceso no autorizado | Middleware `auth` + `authorize` (RBAC) + verificación de propiedad en servicios. |
| Inyección SQL | Consultas parametrizadas en todos los repositorios. |
| Cabeceras / CORS | `helmet` y CORS restringido por `CORS_ORIGIN`. |
| Fuerza bruta | `express-rate-limit` global + reforzado en auth, y **bloqueo de cuenta** tras N intentos. |
| Robo de sesión | Access token corto + **refresh token rotatorio** (hash en BD) con **detección de reuso** y revocación en logout. |
| Pérdida/recuperación de acceso | Flujo de **recuperación de contraseña** de un solo uso (token hasheado, caduca). |
| Trazabilidad y cumplimiento | **Auditoría** de acciones sensibles y **borrado lógico** (no se pierde el histórico). |
| Configuración insegura | `JWT_SECRET` obligatorio (≥32 caracteres) validado al arrancar. |

## Observabilidad

- **Logging estructurado** con pino (`config/logger.ts`); el middleware `httpLogger`
  (pino-http) asigna un `request-id` por petición (cabecera `x-request-id`) y expone
  `req.log` para correlacionar trazas. JSON en producción, salida legible en desarrollo.
- **Errores con código**: `HttpError` lleva un `code` estable y legible por máquina
  (p. ej. `EMAIL_EN_USO`, `CUENTA_BLOQUEADA`) además del mensaje.
- **Auditoría**: el módulo `audit` registra quién hizo qué y cuándo en operaciones
  sensibles (cambios de rol/estado, borrados, cambios de estado de postulación).

## Frontend

- **Componentes UI** reutilizables y accesibles (`components/ui`): foco visible, `aria-*`, labels.
- **AuthProvider** mantiene la sesión; el interceptor de axios **refresca el token de
  forma transparente** ante un 401 y solo cierra sesión si el refresco falla.
- **ErrorBoundary** global evita la pantalla en blanco ante errores de render.
- **TanStack Query** gestiona caché, estados de carga/error y revalidación.
- **Rutas protegidas** (`ProtectedRoute`) y por rol (`RoleRoute`).
- **Identidad visual verde** y diseño *mobile‑first* con Tailwind.

## Despliegue y CI

- **Docker**: imágenes multi-stage para backend (Node) y frontend (nginx que sirve la
  SPA y proxya `/api`), orquestadas con `docker-compose` junto a MySQL.
- **CI** (GitHub Actions): lint · typecheck · test · build por paquete en cada push/PR.
