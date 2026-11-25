import { z } from 'zod';

export const disputeSchema = z.object({
  reason: z.string().min(5).max(1000),
});

export const resolveDisputeSchema = z.object({
  note: z.string().min(1).max(1000),
});