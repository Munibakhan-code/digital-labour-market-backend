import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { workerService } from '../services/worker.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { userService } from '../services/user.service';
import { VerificationStatus } from '@prisma/client';

export const adminController = {
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const [items, total] = await userRepository.list({
      role: q.role,
      verificationStatus: q.verificationStatus,
      search: q.search,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, {
      items,
      pagination: {
        page: q.page ?? 1,
        limit: q.limit ?? 20,
        total,
        totalPages: Math.ceil(total / (q.limit ?? 20)),
      },
    });
  }),

  getUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.publicProfile(req.params.userId);
    if (!user) throw ApiError.notFound('User not found');
    return sendSuccess(res, user);
  }),

  listVerification: asyncHandler(async (req: Request, res: Response) => {
    const q = (req as any).validatedQuery ?? req.query;
    const result = await workerService.listForVerification({
      status: q.status,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
    return sendSuccess(res, result);
  }),

  getWorker: asyncHandler(async (req: Request, res: Response) => {
    const result = await workerService.getVerificationDetail(req.params.workerId);
    return sendSuccess(res, result);
  }),

  approveWorker: asyncHandler(async (req: Request, res: Response) => {
    const result = await workerService.approve(req.params.workerId);
    return sendSuccess(res, result);
  }),

  rejectWorker: asyncHandler(async (req: Request, res: Response) => {
    const result = await workerService.reject(req.params.workerId, req.body.reason);
    return sendSuccess(res, result);
  }),
};