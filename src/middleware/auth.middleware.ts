import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized('Missing access token'));

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
  } catch {
    // ignore
  }
  return next();
}