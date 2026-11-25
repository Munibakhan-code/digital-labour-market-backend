import { prisma } from '../config/prisma';
import { ratingRepository } from '../repositories/rating.repository';
import { ApiError } from '../utils/ApiError';

export const ratingService = {
  async create(jobId: string, authorId: string, role: string, data: { rating: number; comment?: string }) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw ApiError.notFound('Job not found');
    if (job.status !== 'completed') throw ApiError.badRequest('Job must be completed to rate');

    if (role === 'customer' && job.customerId !== authorId) throw ApiError.forbidden('Not your job');
    if (role === 'worker' && job.workerId !== authorId) throw ApiError.forbidden('Not your job');

    const existing = await ratingRepository.findByJobAndAuthor(jobId, authorId);
    if (existing) throw ApiError.conflict('You have already rated this job');

    let targetId: string;
    if (role === 'customer') {
      if (!job.workerId) throw ApiError.badRequest('No worker assigned');
      targetId = job.workerId;
    } else {
      targetId = job.customerId;
    }

    return ratingRepository.create({
      jobId,
      authorId,
      targetId,
      rating: data.rating,
      comment: data.comment,
    });
  },

  async listForWorker(workerUserId: string, params: { page: number; limit: number }) {
    const [items, total, agg] = await ratingRepository.listForWorker(workerUserId, params);
    return {
      items,
      average: agg._avg.rating ?? 0,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },
};