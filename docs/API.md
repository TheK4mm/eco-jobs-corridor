# Referencia de la API

- **Base URL**: `http://localhost:4000/api/v1`
- **Documentación interactiva**: `http://localhost:4000/api/docs` (Swagger UI)
- **Autenticación**: JWT en cabecera `Authorization: Bearer <token>`
- **Respuestas paginadas**: `{ "data": [...], "pagination": { page, limit, total, totalPages } }`
- **Errores**: `{ "message": "...", "code"?: "...", "errors"?: { campo: [..] } }` con código
  HTTP adecuado (`400` validación, `401` no autenticado, `403` sin permiso, `404` no
  encontrado, `409` conflicto, `429` bloqueo/límite, `503` BD no disponible). `code` es un
  identificador estable y legible por máquina (p. ej. `EMAIL_EN_USO`, `CUENTA_BLOQUEADA`).
- **Request-id**: cada respuesta incluye la cabecera `x-request-id` para trazabilidad.

## Auth

| Método | Ruta | Acceso | Cuerpo / Notas |
|--------|------|--------|----------------|
| POST | `/auth/register` | Público | `{ nombre, email, contrasena, rol? }` — `rol` ∈ {candidato, empleador} |
| POST | `/auth/login` | Público | `{ email, contrasena }` → `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | Público | `{ refreshToken }` → `{ accessToken, refreshToken }` (rotación) |
| POST | `/auth/logout` | Público | `{ refreshToken }` — revoca el refresh token |
| POST | `/auth/forgot-password` | Público | `{ email }` — respuesta neutra; envía enlace por correo |
| POST | `/auth/reset-password` | Público | `{ token, contrasena }` — restablece y revoca sesiones |
| GET | `/auth/me` | Autenticado | Devuelve el usuario actual |

> El access token es de corta duración; el cliente usa `/auth/refresh` (con rotación y
> detección de reuso) para renovarlo. Tras 5 intentos de login fallidos la cuenta se
> bloquea temporalmente (`429`, `code: CUENTA_BLOQUEADA`).

## Usuarios

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/usuarios` | Admin | Paginado. Filtros: `rol`, `q`, `activo`, `page`, `limit` |
| GET | `/usuarios/:id` | Dueño o admin | |
| PATCH | `/usuarios/:id` | Dueño o admin | `{ nombre?, email?, contrasena? }` |
| DELETE | `/usuarios/:id` | Dueño o admin | |
| PATCH | `/usuarios/:id/role` | Admin | `{ rol }` |
| PATCH | `/usuarios/:id/status` | Admin | `{ activo: boolean }` |

## Perfiles

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/perfiles/habilidades` | Público | Catálogo de habilidades |
| GET | `/perfiles/candidate/me` | Candidato/Admin | Perfil propio + habilidades |
| PUT | `/perfiles/candidate/me` | Candidato/Admin | Upsert; `{ ..., habilidades: number[] }` |
| GET | `/perfiles/candidate/:userId` | Autenticado | |
| GET | `/perfiles/employer/me` | Empleador/Admin | |
| PUT | `/perfiles/employer/me` | Empleador/Admin | `{ nombre_empresa, ... }` |
| GET | `/perfiles/employer/:userId` | Público | |

## Ofertas

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/ofertas` | Público | Solo activas. Filtros: `q`, `id_categoria`, `id_empleador`, `ubicacion`, `modalidad`, `tipo_contrato`, `salario_min`, `page`, `limit` |
| GET | `/ofertas/:id` | Público | Detalle |
| GET | `/ofertas/mine` | Empleador/Admin | Ofertas propias (cualquier estado) |
| POST | `/ofertas` | Empleador/Admin | `{ titulo, descripcion, ... }` |
| PATCH | `/ofertas/:id` | Dueño/Admin | Actualización parcial |
| DELETE | `/ofertas/:id` | Dueño/Admin | |
| GET | `/ofertas/:id/applications` | Dueño/Admin | Postulantes de la oferta |

## Postulaciones

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| POST | `/postulaciones` | Candidato/Admin | `{ id_oferta, mensaje? }` → notifica al empleador |
| GET | `/postulaciones/mine` | Candidato/Admin | Postulaciones propias |
| GET | `/postulaciones/:id` | Candidato, dueño de la oferta o admin | |
| PATCH | `/postulaciones/:id/status` | Empleador dueño/Admin | `{ estado }` → notifica al candidato |
| DELETE | `/postulaciones/:id` | Candidato dueño/Admin | Retirar postulación |

Estados de postulación: `enviada`, `en_revision`, `preseleccionado`, `rechazado`, `aceptado`.

## Empleos guardados

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/guardados` | Autenticado | Ofertas guardadas (paginado) |
| GET | `/guardados/ids` | Autenticado | `{ ids: number[] }` para marcar estado en listados |
| POST | `/guardados/:id` | Autenticado | Guarda la oferta `:id` (idempotente) |
| DELETE | `/guardados/:id` | Autenticado | Quita la oferta de guardados |

## Alertas de empleo

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/alertas` | Candidato/Admin | Alertas del usuario |
| POST | `/alertas` | Candidato/Admin | `{ palabra_clave?, id_categoria?, modalidad? }` (al menos un criterio) |
| DELETE | `/alertas/:id` | Candidato/Admin | |

Al publicarse una oferta activa, las alertas coincidentes generan notificación in‑app y correo.

## Mensajes

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/mensajes/:idPostulacion` | Candidato, empleador dueño o admin | Conversación; marca como leídos los entrantes |
| POST | `/mensajes/:idPostulacion` | Candidato, empleador dueño o admin | `{ cuerpo }` → notifica al otro participante |

## Notificaciones

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/notificaciones` | Autenticado | Paginado |
| GET | `/notificaciones/unread-count` | Autenticado | `{ count }` |
| PATCH | `/notificaciones/:id/read` | Autenticado | |
| PATCH | `/notificaciones/read-all` | Autenticado | |

## Categorías

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/categorias` | Público | |
| POST | `/categorias` | Admin | `{ nombre }` |
| PATCH | `/categorias/:id` | Admin | `{ nombre }` |
| DELETE | `/categorias/:id` | Admin | |

## Admin

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/admin/stats` | Admin | Métricas (usuarios por rol, ofertas, postulaciones) |
| GET | `/admin/ofertas` | Admin | Todas las ofertas (cualquier estado), con filtros |
| GET | `/admin/auditoria` | Admin | Registro de auditoría (paginado). Filtros: `entidad`, `accion` |

## Salud

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/health` | Público | `{ status, db, timestamp }` |
