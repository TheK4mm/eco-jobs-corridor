import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { healthCheck } from './config/db';
import { openapiSpec } from './docs/openapi';
import { RATE_LIMIT } from './constants/security';
import { httpLogger } from './middleware/httpLogger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { asyncHandler } from './utils/asyncHandler';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import profilesRoutes from './modules/profiles/profiles.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import adminRoutes from './modules/admin/admin.routes';

const API = '/api/v1';

export function createApp(): Express {
  const app = express();
  app.set('trust proxy', 1);

  // Seguridad y middlewares globales
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(httpLogger);
  app.use(
    rateLimit({
      ...RATE_LIMIT.global,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Demasiadas peticiones. Intenta más tarde.' },
    }),
  );

  // Health check (incluye estado de la BD)
  app.get(
    `${API}/health`,
    asyncHandler(async (_req, res) => {
      const db = await healthCheck().catch(() => false);
      res.json({ status: 'ok', db, timestamp: new Date().toISOString() });
    }),
  );

  // Documentación interactiva
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.get('/api/docs.json', (_req, res) => {
    res.json(openapiSpec);
  });

  // Rutas de la API (recursos en español, coherentes con el dominio)
  app.use(`${API}/auth`, authRoutes);
  app.use(`${API}/usuarios`, usersRoutes);
  app.use(`${API}/perfiles`, profilesRoutes);
  app.use(`${API}/ofertas`, jobsRoutes);
  app.use(`${API}/postulaciones`, applicationsRoutes);
  app.use(`${API}/notificaciones`, notificationsRoutes);
  app.use(`${API}/categorias`, categoriesRoutes);
  app.use(`${API}/admin`, adminRoutes);

  // 404 y manejo central de errores (siempre al final)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
