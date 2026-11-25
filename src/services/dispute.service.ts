import { disputeRepository } from '../repositories/dispute.repository';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../config/prisma';

export const disputeService = {
  async create(jobId: string, raisedById: string, role: string, reason: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw ApiError.notFound('Job not found');
    if (role === 'customer' && job.customerId !== raisedById) throw ApiError.forbidden('Not your job');
    if (role === 'worker' && job.workerId !== raisedById) throw ApiError.forbidden('Not your job');
    if (!['in_progress', 'completed'].includes(job.status)) {
      throw ApiError.badRequest('Dispute can only be raised for active or completed jobs');
    }

    const dispute = await disputeRepository.create({ jobId, raisedById, reason });

    // Mark job as disputed if in_progress
    if (job.status === 'in_progress') {
      await prisma.job.update({ where: { id: jobId }, data: { status: 'disputed' } });
    }

    return dispute;
  },

  async list(params: { status?: string; page: number; limit: number }) {
    const [items, total] = await disputeRepository.list(params);
    return {
      items,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },

  async getById(id: string) {
    const dispute = await disputeRepository.findById(id);
    if (!dispute) throw ApiError.notFound('Dispute not found');
    return dispute;
  },

  async resolve(id: string, note: string) {
    const dispute = await disputeRepository.findById(id);
    if (!dispute) throw ApiError.notFound('Dispute not found');
    return disputeRepository.resolve(id, note);
  },
};