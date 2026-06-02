import { Router } from 'express';
import * as jobsController from './jobs.controller';
import * as applicationsController from '../applications/applications.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../users/users.validation';
import { createJobSchema, listJobsSchema, updateJobSchema } from './jobs.validation';

const router = Router();

// Rutas públicas (cualquiera puede explorar ofertas activas, sin iniciar sesión)
router.get('/', validate({ query: listJobsSchema }), jobsController.listPublic);

// Rutas de empleador (deben ir antes de '/:id' para no colisionar)
router.get('/mine', auth, authorize('empleador', 'admin'), jobsController.listMine);
router.post(
  '/',
  auth,
  authorize('empleador', 'admin'),
  validate({ body: createJobSchema }),
  jobsController.create,
);

router.get('/:id', validate({ params: idParamSchema }), jobsController.getById);
router.patch(
  '/:id',
  auth,
  authorize('empleador', 'admin'),
  validate({ params: idParamSchema, body: updateJobSchema }),
  jobsController.update,
);
router.delete(
  '/:id',
  auth,
  authorize('empleador', 'admin'),
  validate({ params: idParamSchema }),
  jobsController.remove,
);

// Postulantes de una oferta (solo el empleador dueño o admin)
router.get(
  '/:id/applications',
  auth,
  authorize('empleador', 'admin'),
  validate({ params: idParamSchema }),
  applicationsController.listByJob,
);

export default router;
