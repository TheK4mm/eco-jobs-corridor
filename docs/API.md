# Referencia de la API

- **Base URL**: `http://localhost:4000/api/v1`
- **Documentación interactiva**: `http://localhost:4000/api/docs` (Swagger UI)
- **Autenticación**: JWT en cabecera `Authorization: Bearer <token>`
- **Respuestas paginadas**: `{ "data": [...], "pagination": { page, limit, total, totalPages } }`
- **Errores**: `{ "message": "...", "errors"?: { campo: [..] } }` con código HTTP adecuado
  (`400` validación, `401` no autenticado, `403` sin permiso, `404` no encontrado,
  `409` conflicto, `503` BD no disponible).

## Auth

| Método | Ruta | Acceso | Cuerpo / Notas |
|--------|------|--------|----------------|
| POST | `/auth/register` | Público | `{ nombre, email, contrasena, rol? }` — `rol` ∈ {candidato, empleador} |
| POST | `/auth/login` | Público | `{ email, contrasena }` → `{ token, user }` |
| GET | `/auth/me` | Autenticado | Devuelve el usuario actual |

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
| GET | `/ofertas` | Público | Solo activas. Filtros: `q`, `id_categoria`, `ubicacion`, `modalidad`, `tipo_contrato`, `salario_min`, `page`, `limit` |
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

## Salud

| Método | Ruta | Acceso | Notas |
|--------|------|--------|-------|
| GET | `/health` | Público | `{ status, db, timestamp }` |
