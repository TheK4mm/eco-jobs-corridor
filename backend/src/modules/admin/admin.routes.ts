import { Router } from 'express';
import * as controller from './admin.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { listJobsSchema } from '../jobs/jobs.validation';

const router = Router();

router.use(auth, authorize('admin'));

router.get('/stats', controller.stats);
router.get('/ofertas', validate({ query: listJobsSchema }), controller.listJobs);
router.get('/auditoria', controller.listAudit);

export default router;
