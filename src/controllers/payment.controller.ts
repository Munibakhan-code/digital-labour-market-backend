import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const paymentController = {
  instructions: asyncHandler(async (_req: Request, res: Response) => {
    return sendSuccess(res, paymentService.instructions());
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    const result = await paymentService.submit(req.params.jobId, req.user!.userId, {
      transactionReference: req.body.transactionReference,
      screenshotPath: file?.path,
    });
    return sendSuccess(res, result, 201);
  }),

  listPending: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await paymentService.listPending({
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.getById(req.params.paymentId);
    return sendSuccess(res, result);
  }),

  confirm: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.confirm(
      req.params.paymentId,
      req.user!.userId,
      req.body.transactionReference,
    );
    return sendSuccess(res, result);
  }),
};