import { Request, Response } from 'express';
import { disputeService } from '../services/dispute.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const disputeController = {
  createForJob: asyncHandler(async (req: Request, res: Response) => {
    const result = await disputeService.create(
      req.params.jobId,
      req.user!.userId,
      req.user!.role,
      req.body.reason,
    );
    return sendSuccess(res, result, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await disputeService.list({
      status: q.status,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const result = await disputeService.getById(req.params.disputeId);
    return sendSuccess(res, result);
  }),

  resolve: asyncHandler(async (req: Request, res: Response) => {
    const result = await disputeService.resolve(req.params.disputeId, req.body.note);
    return sendSuccess(res, result);
  }),
};