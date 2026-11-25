import { Router } from 'express';
import { adminAuthController } from '../controllers/adminAuth.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { adminLoginSchema, adminRefreshSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', authRateLimit, validationMiddleware(adminLoginSchema), adminAuthController.login);
router.post('/refresh', validationMiddleware(adminRefreshSchema), adminAuthController.refresh);
router.post('/logout', validationMiddleware(adminRefreshSchema), adminAuthController.logout);
router.get('/me', authMiddleware, roleMiddleware('admin'), adminAuthController.me);

export default router;