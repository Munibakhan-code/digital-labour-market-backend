import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { submitPaymentSchema } from '../validators/payment.validator';

const router = Router();

router.use(authMiddleware);

router.get('/instructions', paymentController.instructions);
router.post(
  '/jobs/:jobId/submit',
  roleMiddleware('customer'),
  uploadMiddleware.single('screenshot'),
  validationMiddleware(submitPaymentSchema),
  paymentController.submit,
);

export default router;