import { Request, Response } from 'express';
import { walletService } from '../services/wallet.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const walletController = {
  getWallet: asyncHandler(async (req: Request, res: Response) => {
    const result = await walletService.getWallet(req.user!.userId);
    return sendSuccess(res, result);
  }),

  listTransactions: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await walletService.listTransactions(req.user!.userId, {
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),
};