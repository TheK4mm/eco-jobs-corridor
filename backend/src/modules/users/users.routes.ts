import { Router } from 'express';
import * as usersController from './users.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  idParamSchema,
  listUsersSchema,
  updateRoleSchema,
  updateStatusSchema,
  updateUserSchema,
} from './users.validation';

const router = Router();

router.use(auth); // todas las rutas de usuarios requieren autenticación

router.get('/', authorize('admin'), validate({ query: listUsersSchema }), usersController.list);
router.get('/:id', validate({ params: idParamSchema }), usersController.getById);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateUserSchema }),
  usersController.update,
);
router.delete('/:id', validate({ params: idParamSchema }), usersController.remove);
router.patch(
  '/:id/role',
  authorize('admin'),
  validate({ params: idParamSchema, body: updateRoleSchema }),
  usersController.updateRole,
);
router.patch(
  '/:id/status',
  authorize('admin'),
  validate({ params: idParamSchema, body: updateStatusSchema }),
  usersController.updateStatus,
);

export default router;
