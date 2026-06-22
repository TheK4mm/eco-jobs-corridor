import { Router } from 'express';
import * as controller from './messages.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../users/users.validation';
import { sendMessageSchema } from './messages.validation';

const router = Router();

router.use(auth);

// El :id es el id de la postulación (la conversación es la propia postulación).
router.get('/:id', validate({ params: idParamSchema }), controller.list);
router.post('/:id', validate({ params: idParamSchema, body: sendMessageSchema }), controller.send);

export default router;
