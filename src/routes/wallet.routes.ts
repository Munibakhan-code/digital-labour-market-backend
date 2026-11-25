import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware, roleMiddleware('worker'));

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.listTransactions);

export default router;