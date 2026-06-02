import { Router } from 'express';
import * as controller from './profiles.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  candidatoProfileSchema,
  empleadorProfileSchema,
  userIdParamSchema,
} from './profiles.validation';

const router = Router();

// Catálogo de habilidades (público)
router.get('/habilidades', controller.listHabilidades);

// ── Perfil de candidato ────────────────────────────────────────────────
router.get('/candidate/me', auth, authorize('candidato', 'admin'), controller.getMyCandidato);
router.put(
  '/candidate/me',
  auth,
  authorize('candidato', 'admin'),
  validate({ body: candidatoProfileSchema }),
  controller.upsertMyCandidato,
);
router.get(
  '/candidate/:userId',
  auth,
  validate({ params: userIdParamSchema }),
  controller.getCandidatoByUserId,
);

// ── Perfil de empleador ────────────────────────────────────────────────
router.get('/employer/me', auth, authorize('empleador', 'admin'), controller.getMyEmpleador);
router.put(
  '/employer/me',
  auth,
  authorize('empleador', 'admin'),
  validate({ body: empleadorProfileSchema }),
  controller.upsertMyEmpleador,
);
router.get(
  '/employer/:userId',
  validate({ params: userIdParamSchema }),
  controller.getEmpleadorByUserId,
);

export default router;
