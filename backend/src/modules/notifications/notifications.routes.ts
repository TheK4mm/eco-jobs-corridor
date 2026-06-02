import { Router } from 'express';
import * as controller from './notifications.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../users/users.validation';

const router = Router();

router.use(auth);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', validate({ params: idParamSchema }), controller.markRead);

export default router;
