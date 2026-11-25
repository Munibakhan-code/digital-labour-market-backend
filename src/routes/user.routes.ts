import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

router.use(authMiddleware);
router.get('/me', userController.getMe);
router.patch('/me', validationMiddleware(updateUserSchema), userController.updateMe);

export default router;