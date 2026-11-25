import { prisma } from '../config/prisma';

export const ratingRepository = {
  create(data: { jobId: string; authorId: string; targetId: string; rating: number; comment?: string }) {
    return prisma.rating.create({ data });
  },
  findByJobAndAuthor(jobId: string, authorId: string) {
    return prisma.rating.findUnique({
      where: { jobId_authorId: { jobId, authorId } },
    });
  },
  listForWorker(targetId: string, params: { page: number; limit: number }) {
    const where = { targetId };
    return prisma.$transaction([
      prisma.rating.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, fullName: true } } },
      }),
      prisma.rating.count({ where }),
      prisma.rating.aggregate({ where, _avg: { rating: true } }),
    ]);
  },
};