import { prisma } from '../config/prisma';
import { PaymentStatus } from '@prisma/client';

export const paymentRepository = {
  findByJobId(jobId: string) {
    return prisma.payment.findUnique({ where: { jobId } });
  },
  findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: { job: true },
    });
  },
  create(data: {
    jobId: string;
    amount: number;
    transactionReference?: string;
    screenshotPath?: string;
  }) {
    return prisma.payment.create({ data });
  },
  update(id: string, data: { status?: PaymentStatus; transactionReference?: string; confirmedAt?: Date; confirmedBy?: string }) {
    return prisma.payment.update({ where: { id }, data });
  },
  listPending(params: { page: number; limit: number }) {
    const where = { status: PaymentStatus.pending };
    return prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { submittedAt: 'desc' },
        include: { job: { select: { id: true, title: true, amount: true, customerId: true } } },
      }),
      prisma.payment.count({ where }),
    ]);
  },
};