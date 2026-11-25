import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound('Route not found'));
}