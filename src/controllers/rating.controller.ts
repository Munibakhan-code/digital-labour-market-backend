import { Request, Response } from 'express';
import { ratingService } from '../services/rating.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const ratingController = {
  createForJob: asyncHandler(async (req: Request, res: Response) => {
    const result = await ratingService.create(
      req.params.jobId,
      req.user!.userId,
      req.user!.role,
      req.body,
    );
    return sendSuccess(res, result, 201);
  }),

  listForWorker: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await ratingService.listForWorker(req.params.workerId, {
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),
};