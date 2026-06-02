import { config } from '../config/env';

/**
 * Especificación OpenAPI 3 (curada a mano) servida en /api/docs mediante
 * swagger-ui-express. Documenta los endpoints principales de la API.
 */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API — Plataforma de Empleo Corredor Ecológico',
    version: '2.0.0',
    description:
      'API REST para la gestión de usuarios, ofertas laborales, postulaciones, ' +
      'perfiles, notificaciones y administración. Autenticación con JWT (Bearer).',
  },
  servers: [{ url: `http://localhost:${config.port}/api/v1`, description: 'Servidor local' }],
  tags: [
    { name: 'Auth', description: 'Registro, inicio de sesión y sesión actual' },
    { name: 'Usuarios', description: 'Gestión de cuentas (admin / propietario)' },
    { name: 'Perfiles', description: 'Perfiles de candidato y empleador' },
    { name: 'Ofertas', description: 'CRUD de ofertas y búsqueda pública' },
    { name: 'Postulaciones', description: 'Postulaciones y cambios de estado' },
    { name: 'Notificaciones', description: 'Notificaciones in-app' },
    { name: 'Categorías', description: 'Catálogo de categorías' },
    { name: 'Admin', description: 'Panel administrativo' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { message: { type: 'string' }, errors: { type: 'object' } },
      },
      Credenciales: {
        type: 'object',
        required: ['email', 'contrasena'],
        properties: {
          email: { type: 'string', example: 'admin@corredorempleo.co' },
          contrasena: { type: 'string', example: 'Admin1234*' },
        },
      },
      Registro: {
        type: 'object',
        required: ['nombre', 'email', 'contrasena'],
        properties: {
          nombre: { type: 'string', example: 'Laura Gómez' },
          email: { type: 'string', example: 'laura@example.com' },
          contrasena: { type: 'string', example: 'Clave123' },
          rol: { type: 'string', enum: ['candidato', 'empleador'], example: 'candidato' },
        },
      },
      Oferta: {
        type: 'object',
        properties: {
          id_oferta: { type: 'integer' },
          titulo: { type: 'string' },
          descripcion: { type: 'string' },
          empresa: { type: 'string', nullable: true },
          ubicacion: { type: 'string' },
          modalidad: { type: 'string', enum: ['presencial', 'remoto', 'hibrido'] },
          tipo_contrato: { type: 'string' },
          salario_min: { type: 'number', nullable: true },
          salario_max: { type: 'number', nullable: true },
          estado: { type: 'string', enum: ['activa', 'cerrada', 'borrador'] },
        },
      },
      OfertaInput: {
        type: 'object',
        required: ['titulo', 'descripcion'],
        properties: {
          titulo: { type: 'string', example: 'Guía Turístico Bilingüe' },
          descripcion: { type: 'string', example: 'Acompañamiento de turistas...' },
          empresa: { type: 'string' },
          ubicacion: { type: 'string', example: 'Villavicencio, Meta' },
          id_categoria: { type: 'integer', example: 2 },
          modalidad: { type: 'string', enum: ['presencial', 'remoto', 'hibrido'] },
          tipo_contrato: {
            type: 'string',
            enum: ['tiempo_completo', 'medio_tiempo', 'temporal', 'practica', 'freelance'],
          },
          salario_min: { type: 'number' },
          salario_max: { type: 'number' },
          estado: { type: 'string', enum: ['activa', 'cerrada', 'borrador'] },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: { tags: ['Admin'], summary: 'Estado del servicio y la BD', responses: { 200: { description: 'OK' } } },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar un nuevo usuario (candidato o empleador)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Registro' } } },
        },
        responses: { 201: { description: 'Usuario creado' }, 409: { description: 'Email ya registrado' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión y obtener un JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Credenciales' } } },
        },
        responses: { 200: { description: 'Token emitido' }, 401: { description: 'Credenciales inválidas' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Datos del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Usuario' }, 401: { description: 'No autenticado' } },
      },
    },
    '/ofertas': {
      get: {
        tags: ['Ofertas'],
        summary: 'Listar ofertas activas (búsqueda y filtros)',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'id_categoria', in: 'query', schema: { type: 'integer' } },
          { name: 'ubicacion', in: 'query', schema: { type: 'string' } },
          { name: 'modalidad', in: 'query', schema: { type: 'string' } },
          { name: 'tipo_contrato', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Listado paginado' } },
      },
      post: {
        tags: ['Ofertas'],
        summary: 'Crear oferta (empleador/admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OfertaInput' } } },
        },
        responses: { 201: { description: 'Oferta creada' }, 403: { description: 'No autorizado' } },
      },
    },
    '/ofertas/{id}': {
      get: { tags: ['Ofertas'], summary: 'Detalle de una oferta', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Oferta' }, 404: { description: 'No encontrada' } } },
      patch: { tags: ['Ofertas'], summary: 'Actualizar oferta (dueño/admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Actualizada' } } },
      delete: { tags: ['Ofertas'], summary: 'Eliminar oferta (dueño/admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Eliminada' } } },
    },
    '/ofertas/mine': {
      get: { tags: ['Ofertas'], summary: 'Mis ofertas (empleador)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Listado' } } },
    },
    '/ofertas/{id}/applications': {
      get: { tags: ['Ofertas'], summary: 'Postulantes de una oferta (dueño/admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Listado' } } },
    },
    '/postulaciones': {
      post: { tags: ['Postulaciones'], summary: 'Postularse a una oferta (candidato)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Postulación creada' }, 409: { description: 'Ya postulado' } } },
    },
    '/postulaciones/mine': {
      get: { tags: ['Postulaciones'], summary: 'Mis postulaciones (candidato)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Listado' } } },
    },
    '/postulaciones/{id}/status': {
      patch: { tags: ['Postulaciones'], summary: 'Cambiar estado (empleador dueño/admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Estado actualizado' } } },
    },
    '/notificaciones': {
      get: { tags: ['Notificaciones'], summary: 'Listar notificaciones', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Listado' } } },
    },
    '/categorias': {
      get: { tags: ['Categorías'], summary: 'Listar categorías', responses: { 200: { description: 'Listado' } } },
    },
    '/admin/stats': {
      get: { tags: ['Admin'], summary: 'Métricas globales', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Estadísticas' } } },
    },
  },
  security: [],
};
