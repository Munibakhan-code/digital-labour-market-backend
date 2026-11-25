import { Request, Response } from 'express';
import { workerService } from '../services/worker.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const workerController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const result = await workerService.getMe(req.user!.userId);
    return sendSuccess(res, result);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const result = await workerService.updateMe(req.user!.userId, req.body);
    return sendSuccess(res, result);
  }),

  submitCnic: asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as { [field: string]: Express.Multer.File[] };
    if (!files?.cnicFront?.[0] || !files?.cnicBack?.[0]) {
      throw ApiError.badRequest('Both cnicFront and cnicBack files are required');
    }
    const result = await workerService.submitCnic(
      req.user!.userId,
      req.body.cnicNumber,
      files.cnicFront[0].path,
      files.cnicBack[0].path,
    );
    return sendSuccess(res, result);
  }),

  submitVerification: asyncHandler(async (req: Request, res: Response) => {
    const result = await workerService.submitVerification(req.user!.userId);
    return sendSuccess(res, result);
  }),

  listPublic: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await workerService.listPublic({
      skill: q.skill,
      search: q.search,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),

  getPublicById: asyncHandler(async (req: Request, res: Response) => {
    const result = await workerService.getPublicById(req.params.workerId);
    return sendSuccess(res, result);
  }),
};