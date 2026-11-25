import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export const locationService = {
  async upsertCurrent(userId: string, latitude: number, longitude: number) {
    const worker = await prisma.workerProfile.findUnique({ where: { userId } });
    if (!worker) throw ApiError.notFound('Worker profile not found');

    return prisma.location.create({
      data: { workerId: worker.id, latitude, longitude },
    });
  },

  async getForWorker(workerId: string, viewer: { userId: string; role: string }) {
    const worker = await prisma.workerProfile.findUnique({ where: { id: workerId } });
    if (!worker) throw ApiError.notFound('Worker not found');

    if (viewer.role === 'admin') {
      return prisma.location.findFirst({
        where: { workerId },
        orderBy: { timestamp: 'desc' },
      });
    }

    if (viewer.role === 'customer') {
      // customer can access only if they own an active job with this worker
      const activeJob = await prisma.job.findFirst({
        where: {
          customerId: viewer.userId,
          workerId: worker.userId,
          status: { in: ['accepted', 'in_progress'] },
        },
      });
      if (!activeJob) throw ApiError.forbidden('Not allowed');
      return prisma.location.findFirst({
        where: { workerId },
        orderBy: { timestamp: 'desc' },
      });
    }

    throw ApiError.forbidden('Not allowed');
  },
};