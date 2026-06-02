import { Router } from 'express';
import * as controller from './categories.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../users/users.validation';

const router = Router();

router.get('/', controller.list);
router.post(
  '/',
  auth,
  authorize('admin'),
  validate({ body: controller.categoryBodySchema }),
  controller.create,
);
router.patch(
  '/:id',
  auth,
  authorize('admin'),
  validate({ params: idParamSchema, body: controller.categoryBodySchema }),
  controller.update,
);
router.delete(
  '/:id',
  auth,
  authorize('admin'),
  validate({ params: idParamSchema }),
  controller.remove,
);

export default router;
