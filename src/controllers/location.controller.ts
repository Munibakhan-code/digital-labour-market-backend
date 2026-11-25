import { Request, Response } from 'express';
import { locationService } from '../services/location.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const locationController = {
  upsertCurrent: asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;
    const result = await locationService.upsertCurrent(req.user!.userId, latitude, longitude);
    return sendSuccess(res, result);
  }),

  getWorker: asyncHandler(async (req: Request, res: Response) => {
    const result = await locationService.getForWorker(req.params.workerId, req.user!);
    return sendSuccess(res, result);
  }),
};