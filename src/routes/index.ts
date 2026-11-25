import { Router } from 'express';
import authRoutes from './auth.routes';
import adminAuthRoutes from './adminAuth.routes';
import userRoutes from './user.routes';
import workerRoutes from './worker.routes';
import jobRoutes from './job.routes';
import locationRoutes from './location.routes';
import paymentRoutes from './payment.routes';
import walletRoutes from './wallet.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/users', userRoutes);
router.use('/workers', workerRoutes);
router.use('/jobs', jobRoutes);
router.use('/location', locationRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);

export default router;