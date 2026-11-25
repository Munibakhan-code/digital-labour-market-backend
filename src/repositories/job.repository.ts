import { prisma } from '../config/prisma';
import { JobStatus, JobType, Prisma } from '@prisma/client';

export const jobRepository = {
  create(data: Prisma.JobUncheckedCreateInput) {
    return prisma.job.create({ data });
  },
  findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        worker: { select: { id: true, fullName: true, phone: true } },
        acceptances: {
          include: { worker: { select: { id: true, fullName: true } } },
        },
      },
    });
  },
  listByCustomer(customerId: string, params: { page: number; limit: number }) {
    const where = { customerId };
    return prisma.$transaction([
      prisma.job.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);
  },
  feed(params: { skill?: string; page: number; limit: number }) {
    const where: any = { type: JobType.broadcast, status: JobStatus.posted };
    if (params.skill) where.skill = params.skill;
    return prisma.$transaction([
      prisma.job.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, fullName: true } } },
      }),
      prisma.job.count({ where }),
    ]);
  },
  update(id: string, data: Prisma.JobUpdateInput) {
    return prisma.job.update({ where: { id }, data });
  },
  async addAcceptance(jobId: string, workerId: string) {
    return prisma.jobAcceptance.create({ data: { jobId, workerId } });
  },
  findAcceptance(jobId: string, workerId: string) {
    return prisma.jobAcceptance.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
    });
  },
  listAcceptances(jobId: string) {
    return prisma.jobAcceptance.findMany({
      where: { jobId },
      include: { worker: { select: { id: true, fullName: true, phone: true } } },
    });
  },
};