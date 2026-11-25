import { prisma } from '../config/prisma';
import { jobRepository } from '../repositories/job.repository';
import { ApiError } from '../utils/ApiError';
import { JobStatus, JobType } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  posted: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'disputed', 'cancelled'],
  completed: ['disputed'],
  cancelled: [],
  disputed: ['completed', 'cancelled'],
};

function ensureTransition(from: JobStatus, to: JobStatus) {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw ApiError.badRequest(`Invalid status transition ${from} -> ${to}`);
  }
}

export const jobService = {
  async create(customerId: string, data: {
    title: string;
    description: string;
    skill: string;
    type: 'broadcast' | 'direct';
    estimatedHours?: number;
    amount: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    workerId?: string;
  }) {
    if (data.type === 'direct') {
      if (!data.workerId) throw ApiError.badRequest('workerId is required for direct jobs');
      const worker = await prisma.workerProfile.findUnique({ where: { userId: data.workerId } });
      if (!worker || worker.verificationStatus !== 'approved') {
        throw ApiError.badRequest('Selected worker is not verified or does not exist');
      }
    }

    const job = await jobRepository.create({
      title: data.title,
      description: data.description,
      skill: data.skill,
      type: data.type as JobType,
      amount: data.amount,
      estimatedHours: data.estimatedHours,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      customerId,
      workerId: data.type === 'direct' ? data.workerId : null,
      status: JobStatus.posted,
    });

    return job;
  },

  async listMine(customerId: string, params: { page: number; limit: number }) {
    const [items, total] = await jobRepository.listByCustomer(customerId, params);
    return {
      items,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },

  async feed(workerUserId: string, params: { skill?: string; page: number; limit: number }) {
    // Optional: filter by worker skill if profile exists
    const profile = await prisma.workerProfile.findUnique({ where: { userId: workerUserId } });
    let skill = params.skill;
    if (!skill && profile) {
      const skills = await prisma.workerSkill.findMany({ where: { workerId: profile.id } });
      // Don't auto filter for now; return all posted broadcast jobs
    }
    const [items, total] = await jobRepository.feed({ ...params, skill });
    return {
      items,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },

  async getById(jobId: string, viewer: { userId: string; role: string }) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found');
    if (viewer.role === 'admin') return job;
    if (viewer.role === 'customer' && job.customerId !== viewer.userId) {
      throw ApiError.forbidden('Not your job');
    }
    if (viewer.role === 'worker') {
      // worker can view if assigned OR broadcast posted
      const isAssigned = job.workerId === viewer.userId;
      const isOpenBroadcast = job.type === 'broadcast' && job.status === 'posted';
      if (!isAssigned && !isOpenBroadcast) throw ApiError.forbidden('Not allowed');
    }
    return job;
  },

  async accept(jobId: string, workerUserId: string) {
    return prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({ where: { id: jobId } });
      if (!job) throw ApiError.notFound('Job not found');
      if (job.type !== 'broadcast') throw ApiError.badRequest('Only broadcast jobs can be accepted');
      if (job.status !== 'posted') throw ApiError.badRequest('Job is not open');

      const existing = await tx.jobAcceptance.findUnique({
        where: { jobId_workerId: { jobId, workerId: workerUserId } },
      });
      if (existing) throw ApiError.conflict('Already accepted');

      await tx.jobAcceptance.create({
        data: { jobId, workerId: workerUserId },
      });

      return { accepted: true };
    });
  },

  async decline(jobId: string, workerUserId: string) {
    return prisma.$transaction(async (tx) => {
      const acceptance = await tx.jobAcceptance.findUnique({
        where: { jobId_workerId: { jobId, workerId: workerUserId } },
      });
      if (!acceptance) throw ApiError.notFound('Acceptance not found');
      await tx.jobAcceptance.delete({ where: { id: acceptance.id } });
      return { declined: true };
    });
  },

  async selectWorker(jobId: string, customerId: string, workerUserId: string) {
    return prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({ where: { id: jobId } });
      if (!job) throw ApiError.notFound('Job not found');
      if (job.customerId !== customerId) throw ApiError.forbidden('Not your job');
      if (job.status !== 'posted') throw ApiError.badRequest('Job is not open');
      if (job.type !== 'broadcast') throw ApiError.badRequest('Only broadcast jobs need selection');

      const acceptance = await tx.jobAcceptance.findUnique({
        where: { jobId_workerId: { jobId, workerId: workerUserId } },
      });
      if (!acceptance) throw ApiError.badRequest('Worker has not accepted this job');

      // Conditional update to avoid race
      const updated = await tx.job.updateMany({
        where: { id: jobId, status: 'posted' },
        data: {
          workerId: workerUserId,
          status: JobStatus.accepted,
          selectedAt: new Date(),
          acceptedAt: new Date(),
        },
      });
      if (updated.count === 0) throw ApiError.conflict('Job already assigned');

      await tx.jobAcceptance.update({
        where: { id: acceptance.id },
        data: { isSelected: true },
      });

      return tx.job.findUnique({ where: { id: jobId } });
    });
  },

  async markInProgress(jobId: string, userId: string, role: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found');
    if (role === 'worker' && job.workerId !== userId) throw ApiError.forbidden('Not your job');
    if (role === 'customer' && job.customerId !== userId) throw ApiError.forbidden('Not your job');
    ensureTransition(job.status, 'in_progress');
    return jobRepository.update(jobId, { status: JobStatus.in_progress, startedAt: new Date() });
  },

  async complete(jobId: string, userId: string, role: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found');
    if (role === 'customer' && job.customerId !== userId) throw ApiError.forbidden('Not your job');
    if (role === 'worker' && job.workerId !== userId) throw ApiError.forbidden('Not your job');
    ensureTransition(job.status, 'completed');
    return jobRepository.update(jobId, { status: JobStatus.completed, completedAt: new Date() });
  },

  async cancel(jobId: string, userId: string, role: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found');
    if (role === 'customer' && job.customerId !== userId) throw ApiError.forbidden('Not your job');
    if (role === 'worker' && job.workerId !== userId) throw ApiError.forbidden('Not your job');
    ensureTransition(job.status, 'cancelled');
    return jobRepository.update(jobId, { status: JobStatus.cancelled, cancelledAt: new Date() });
  },
};