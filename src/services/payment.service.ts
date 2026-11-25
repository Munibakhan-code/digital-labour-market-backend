import { prisma } from '../config/prisma';
import { paymentRepository } from '../repositories/payment.repository';
import { ApiError } from '../utils/ApiError';
import { PaymentStatus, WalletTransactionType } from '@prisma/client';

export const paymentService = {
  instructions() {
    return {
      bankName: 'Meezan Bank',
      accountTitle: 'Labor Marketplace (Pvt) Ltd',
      accountNumber: 'PK00MEZN0000000000000000',
      iban: 'PK00MEZN0000000000000000',
      instructions: 'Transfer the exact amount and submit the transaction reference. Screenshot optional.',
    };
  },

  async submit(
    jobId: string,
    customerId: string,
    data: { transactionReference: string; screenshotPath?: string },
  ) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw ApiError.notFound('Job not found');
    if (job.customerId !== customerId) throw ApiError.forbidden('Not your job');
    if (job.status !== 'completed') throw ApiError.badRequest('Job must be completed before payment');

    const existing = await paymentRepository.findByJobId(jobId);
    if (existing && existing.status === 'confirmed') {
      throw ApiError.badRequest('Payment already confirmed');
    }

    if (existing) {
      return paymentRepository.update(existing.id, {
        transactionReference: data.transactionReference,
        screenshotPath: data.screenshotPath ?? existing.screenshotPath ?? undefined,
        status: PaymentStatus.pending,
      });
    }

    return paymentRepository.create({
      jobId,
      amount: job.amount,
      transactionReference: data.transactionReference,
      screenshotPath: data.screenshotPath,
    });
  },

  async listPending(params: { page: number; limit: number }) {
    const [items, total] = await paymentRepository.listPending(params);
    return {
      items,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },

  async getById(paymentId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw ApiError.notFound('Payment not found');
    return payment;
  },

  async confirm(paymentId: string, adminId: string, transactionReference: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { job: true },
      });
      if (!payment) throw ApiError.notFound('Payment not found');
      if (payment.status === 'confirmed') throw ApiError.badRequest('Already confirmed');
      if (!payment.job.workerId) throw ApiError.badRequest('Job has no assigned worker');

      // 1. Confirm payment
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.confirmed,
          transactionReference,
          confirmedAt: new Date(),
          confirmedBy: adminId,
        },
      });

      // 2. Mark job paid
      await tx.job.update({
        where: { id: payment.jobId },
        data: { paymentStatus: 'paid' },
      });

      // 3. Credit wallet (create if not exists)
      const workerProfile = await tx.workerProfile.findUnique({
        where: { userId: payment.job.workerId },
      });
      if (!workerProfile) throw ApiError.badRequest('Worker profile missing');

      let wallet = await tx.wallet.findUnique({ where: { workerId: workerProfile.id } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { workerId: workerProfile.id, balance: 0 } });
      }

      const newBalance = wallet.balance + payment.amount;
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      // 4. Ledger transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.job_payment,
          amount: payment.amount,
          balance: updatedWallet.balance,
          reference: `payment:${payment.id}`,
          description: `Job payment for ${payment.job.title}`,
        },
      });

      return { payment: updatedPayment, wallet: updatedWallet };
    });
  },
};