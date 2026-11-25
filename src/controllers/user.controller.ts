import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const userController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getMe(req.user!.userId);
    return sendSuccess(res, result);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.updateMe(req.user!.userId, req.body);
    return sendSuccess(res, result);
  }),
};