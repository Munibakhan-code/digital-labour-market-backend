import { z } from 'zod';

export const updateWorkerSchema = z.object({
  bio: z.string().max(1000).optional(),
  hourlyRate: z.number().nonnegative().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  isAvailable: z.boolean().optional(),
  skills: z.array(z.string().min(1).max(50)).optional(),
});

export const cnicSchema = z.object({
  cnicNumber: z.string().min(13).max(15),
});