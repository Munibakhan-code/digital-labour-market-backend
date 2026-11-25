import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { paymentController } from '../controllers/payment.controller';
import { disputeController } from '../controllers/dispute.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { confirmPaymentSchema } from '../validators/payment.validator';
import { resolveDisputeSchema } from '../validators/dispute.validator';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.use(authMiddleware, roleMiddleware('admin'));

// Users
router.get('/users', adminController.listUsers);
router.get('/users/:userId', adminController.getUser);

// Worker verification
router.get('/workers/verification', adminController.listVerification);
router.get('/workers/:workerId', adminController.getWorker);
router.post('/workers/:workerId/approve', adminController.approveWorker);
router.post(
  '/workers/:workerId/reject',
  validationMiddleware(z.object({ reason: z.string().min(3).max(500) })),
  adminController.rejectWorker,
);

// Payments
router.get('/payments/pending', paymentController.listPending);
router.get('/payments/:paymentId', paymentController.getById);
router.post(
  '/payments/:paymentId/confirm',
  validationMiddleware(confirmPaymentSchema),
  paymentController.confirm,
);

// Disputes
router.get('/disputes', disputeController.list);
router.get('/disputes/:disputeId', disputeController.getById);
router.post(
  '/disputes/:disputeId/resolve',
  validationMiddleware(resolveDisputeSchema),
  disputeController.resolve,
);

export default router;