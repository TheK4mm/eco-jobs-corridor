import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import { RATE_LIMIT } from '../../constants/security';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

/** Limita los intentos de autenticación para mitigar fuerza bruta. */
const authLimiter = rateLimit({
  ...RATE_LIMIT.auth,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.get('/me', auth, authController.me);

export default router;
