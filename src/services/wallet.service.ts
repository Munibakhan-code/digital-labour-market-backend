import { walletRepository } from '../repositories/wallet.repository';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../config/prisma';

export const walletService = {
  async getWallet(userId: string) {
    const profile = await prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw ApiError.notFound('Worker profile not found');
    const wallet = await walletRepository.createIfNotExists(profile.id);
    return wallet;
  },

  async listTransactions(userId: string, params: { page: number; limit: number }) {
    const profile = await prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw ApiError.notFound('Worker profile not found');
    const wallet = await walletRepository.createIfNotExists(profile.id);
    const [items, total] = await walletRepository.listTransactions(wallet.id, params);
    return {
      items,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },
};