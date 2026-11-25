import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import {
  requestOtpSchema,
  verifyOtpSchema,
  refreshSchema,
} from '../validators/auth.validator';

const router = Router();

router.post(
  '/request-otp',
  authRateLimit,
  validationMiddleware(requestOtpSchema),
  authController.requestOtp,
);
router.post(
  '/verify-otp',
  authRateLimit,
  validationMiddleware(verifyOtpSchema),
  authController.verifyOtp,
);
router.post('/refresh', validationMiddleware(refreshSchema), authController.refresh);
router.post('/logout', validationMiddleware(refreshSchema), authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;