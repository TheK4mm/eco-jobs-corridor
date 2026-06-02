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
`notifications`, `categories`, `admin`) sigue la misma separación de responsabilidades:

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
| Fuerza bruta | `express-rate-limit` global y reforzado en login/registro. |
| Configuración insegura | `JWT_SECRET` obligatorio (≥32 caracteres) validado al arrancar. |

## Frontend

- **Componentes UI** reutilizables y accesibles (`components/ui`): foco visible, `aria-*`, labels.
- **AuthProvider** mantiene la sesión; un interceptor de axios cierra sesión ante un 401.
- **TanStack Query** gestiona caché, estados de carga/error y revalidación.
- **Rutas protegidas** (`ProtectedRoute`) y por rol (`RoleRoute`).
- **Identidad visual verde** y diseño *mobile‑first* con Tailwind.
