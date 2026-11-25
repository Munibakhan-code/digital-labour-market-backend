import { prisma } from '../config/prisma';

export const disputeRepository = {
  create(data: { jobId: string; raisedById: string; reason: string }) {
    return prisma.dispute.create({ data });
  },
  findById(id: string) {
    return prisma.dispute.findUnique({
      where: { id },
      include: { job: true, raisedBy: { select: { id: true, fullName: true, role: true } } },
    });
  },
  list(params: { status?: string; page: number; limit: number }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    return prisma.$transaction([
      prisma.dispute.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { job: { select: { id: true, title: true } }, raisedBy: { select: { id: true, fullName: true } } },
      }),
      prisma.dispute.count({ where }),
    ]);
  },
  resolve(id: string, note: string) {
    return prisma.dispute.update({
      where: { id },
      data: { status: 'resolved', resolutionNote: note, resolvedAt: new Date() },
    });
  },
};