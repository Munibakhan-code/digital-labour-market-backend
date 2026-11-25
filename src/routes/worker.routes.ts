import { Router } from 'express';
import { workerController } from '../controllers/worker.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { ratingController } from '../controllers/rating.controller';
import { updateWorkerSchema, cnicSchema } from '../validators/worker.validator';
import { jobListQuerySchema } from '../validators/job.validator';
import { validationMiddleware as vm } from '../middleware/validation.middleware';

const router = Router();

// Public discovery
router.get('/:workerId/ratings', ratingController.listForWorker);
router.get('/:workerId', optionalAuthMiddleware, workerController.getPublicById);

// Worker self routes
router.get('/me', authMiddleware, roleMiddleware('worker'), workerController.getMe);
router.patch(
  '/me',
  authMiddleware,
  roleMiddleware('worker'),
  validationMiddleware(updateWorkerSchema),
  workerController.updateMe,
);
router.post(
  '/me/cnic',
  authMiddleware,
  roleMiddleware('worker'),
  uploadMiddleware.fields([
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 },
  ]),
  validationMiddleware(cnicSchema),
  workerController.submitCnic,
);
router.post(
  '/me/submit-verification',
  authMiddleware,
  roleMiddleware('worker'),
  workerController.submitVerification,
);

// Listing (must be after /me to avoid conflict)
router.get(
  '/',
  vm(jobListQuerySchema, 'query'),
  workerController.listPublic,
);

export default router;