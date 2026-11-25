import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Role } from '../types';

export function roleMiddleware(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowed.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    return next();
  };
}