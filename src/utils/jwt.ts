import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  role: 'customer' | 'worker' | 'admin';
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.jwt.accessExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.jwt.refreshExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}