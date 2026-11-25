import { z } from 'zod';

export const createJobSchema = z
  .object({
    title: z.string().min(3).max(150),
    description: z.string().min(5).max(2000),
    skill: z.string().min(1).max(50),
    type: z.enum(['broadcast', 'direct']).default('broadcast'),
    estimatedHours: z.number().positive().optional(),
    amount: z.number().positive(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    address: z.string().max(300).optional(),
    workerId: z.string().optional(),
  })
  .refine((data) => data.type !== 'direct' || !!data.workerId, {
    message: 'workerId is required for direct jobs',
    path: ['workerId'],
  });

export const selectWorkerSchema = z.object({
  workerId: z.string().min(1),
});

export const jobListQuerySchema = z.object({
  skill: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().optional(),
});