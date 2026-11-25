import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { ratingController } from '../controllers/rating.controller';
import { disputeController } from '../controllers/dispute.controller';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import {
  createJobSchema,
  selectWorkerSchema,
  jobListQuerySchema,
} from '../validators/job.validator';
import { ratingSchema } from '../validators/rating.validator';
import { disputeSchema } from '../validators/dispute.validator';
import { submitPaymentSchema } from '../validators/payment.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('customer'), validationMiddleware(createJobSchema), jobController.create);
router.get('/my', roleMiddleware('customer'), jobController.listMine);
router.get('/feed', roleMiddleware('worker'), jobController.feed);
router.get('/:jobId', jobController.getById);

router.post('/:jobId/accept', roleMiddleware('worker'), jobController.accept);
router.post('/:jobId/decline', roleMiddleware('worker'), jobController.decline);
router.post(
  '/:jobId/select-worker',
  roleMiddleware('customer'),
  validationMiddleware(selectWorkerSchema),
  jobController.selectWorker,
);

router.patch('/:jobId/in-progress', jobController.markInProgress);
router.patch('/:jobId/complete', jobController.complete);
router.patch('/:jobId/cancel', jobController.cancel);

router.post(
  '/:jobId/rating',
  validationMiddleware(ratingSchema),
  ratingController.createForJob,
);
router.post(
  '/:jobId/dispute',
  validationMiddleware(disputeSchema),
  disputeController.createForJob,
);
router.post(
  '/:jobId/submit',
  roleMiddleware('customer'),
  uploadMiddleware.single('screenshot'),
  validationMiddleware(submitPaymentSchema),
  (req, res, next) => {
    // Actually mounted under /payments
    next();
  },
);

export default router;