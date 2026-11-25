import { z } from 'zod';

export const submitPaymentSchema = z.object({
  transactionReference: z.string().min(3).max(100),
});

export const confirmPaymentSchema = z.object({
  transactionReference: z.string().min(3).max(100),
});