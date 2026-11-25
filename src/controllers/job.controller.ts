import { Request, Response } from 'express';
import { jobService } from '../services/job.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const jobController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.create(req.user!.userId, req.body);
    return sendSuccess(res, result, 201);
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await jobService.listMine(req.user!.userId, {
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),

  feed: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await jobService.feed(req.user!.userId, {
      skill: q.skill,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.getById(req.params.jobId, req.user!);
    return sendSuccess(res, result);
  }),

  accept: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.accept(req.params.jobId, req.user!.userId);
    return sendSuccess(res, result);
  }),

  decline: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.decline(req.params.jobId, req.user!.userId);
    return sendSuccess(res, result);
  }),

  selectWorker: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.selectWorker(req.params.jobId, req.user!.userId, req.body.workerId);
    return sendSuccess(res, result);
  }),

  markInProgress: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.markInProgress(req.params.jobId, req.user!.userId, req.user!.role);
    return sendSuccess(res, result);
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.complete(req.params.jobId, req.user!.userId, req.user!.role);
    return sendSuccess(res, result);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const result = await jobService.cancel(req.params.jobId, req.user!.userId, req.user!.role);
    return sendSuccess(res, result);
  }),
};