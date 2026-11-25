import { z } from 'zod';

export const requestOtpSchema = z.object({
  phone: z.string().min(10).max(20),
  role: z.enum(['customer', 'worker']).default('customer'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(20),
  otp: z.string().length(6),
  role: z.enum(['customer', 'worker']).default('customer'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const adminRefreshSchema = z.object({
  refreshToken: z.string().min(10),
});