import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const walletRepository = {
  findByWorkerId(workerId: string) {
    return prisma.wallet.findUnique({ where: { workerId } });
  },
  createIfNotExists(workerId: string) {
    return prisma.wallet.upsert({
      where: { workerId },
      update: {},
      create: { workerId, balance: 0 },
    });
  },
  credit(
    tx: Prisma.TransactionClient,
    walletId: string,
    amount: number,
    reference: string,
    description: string,
  ) {
    return tx.wallet.update({
      where: { id: walletId },
      data: {
        balance: { increment: amount },
        transactions: {
          create: {
            type: 'job_payment',
            amount,
            balance: 0, // will set below
            reference,
            description,
          },
        },
      },
    });
  },
  listTransactions(walletId: string, params: { page: number; limit: number }) {
    const where = { walletId };
    return prisma.$transaction([
      prisma.walletTransaction.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where }),
    ]);
  },
};