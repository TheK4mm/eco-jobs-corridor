import { Router } from 'express';
import * as controller from './applications.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../users/users.validation';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from './applications.validation';

const router = Router();

router.use(auth);

router.post(
  '/',
  authorize('candidato', 'admin'),
  validate({ body: createApplicationSchema }),
  controller.apply,
);
router.get('/mine', authorize('candidato', 'admin'), controller.listMine);
router.get('/:id', validate({ params: idParamSchema }), controller.getById);
router.patch(
  '/:id/status',
  authorize('empleador', 'admin'),
  validate({ params: idParamSchema, body: updateApplicationStatusSchema }),
  controller.updateStatus,
);
router.delete('/:id', validate({ params: idParamSchema }), controller.remove);

export default router;
