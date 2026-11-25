import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const adminAuthController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.adminLogin(email, password);
    return sendSuccess(res, result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.adminRefresh(refreshToken);
    return sendSuccess(res, result);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.adminLogout(refreshToken);
    return sendSuccess(res, result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.adminMe(req.user!.userId);
    return sendSuccess(res, result);
  }),
};