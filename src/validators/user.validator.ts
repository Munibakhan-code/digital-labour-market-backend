import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});