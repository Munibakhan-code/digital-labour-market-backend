import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
  requestOtp: asyncHandler(async (req: Request, res: Response) => {
    const { phone, role } = req.body;
    const result = authService.requestOtp(phone, role);
    return sendSuccess(res, result);
  }),

  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp, role } = req.body;
    const result = await authService.verifyOtp(phone, otp, role);
    return sendSuccess(res, result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    return sendSuccess(res, result);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    return sendSuccess(res, result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.me(req.user!.userId);
    return sendSuccess(res, result);
  }),
};