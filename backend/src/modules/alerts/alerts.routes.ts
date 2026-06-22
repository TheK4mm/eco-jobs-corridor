import { Router } from 'express';
import * as controller from './alerts.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../users/users.validation';
import { createAlertSchema } from './alerts.validation';

const router = Router();

router.use(auth, authorize('candidato', 'admin'));

router.get('/', controller.list);
router.post('/', validate({ body: createAlertSchema }), controller.create);
router.delete('/:id', validate({ params: idParamSchema }), controller.remove);

export default router;
