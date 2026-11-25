import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { locationSchema } from '../validators/location.validator';

const router = Router();

router.use(authMiddleware);

router.post('/current', roleMiddleware('worker'), validationMiddleware(locationSchema), locationController.upsertCurrent);
router.get('/worker/:workerId', roleMiddleware('customer', 'admin'), locationController.getWorker);

export default router;