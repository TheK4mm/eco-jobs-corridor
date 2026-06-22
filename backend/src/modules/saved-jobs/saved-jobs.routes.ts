import { Router } from 'express';
import * as controller from './saved-jobs.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../users/users.validation';

const router = Router();

router.use(auth);

// Las rutas literales van antes de '/:id'.
router.get('/', controller.list);
router.get('/ids', controller.ids);
router.post('/:id', validate({ params: idParamSchema }), controller.save);
router.delete('/:id', validate({ params: idParamSchema }), controller.unsave);

export default router;
