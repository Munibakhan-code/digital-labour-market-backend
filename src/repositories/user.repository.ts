import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export const userRepository = {
  findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  create(data: { phone: string; role: Role; fullName?: string }) {
    return prisma.user.create({ data });
  },
  update(id: string, data: { fullName?: string; email?: string }) {
    return prisma.user.update({ where: { id }, data });
  },
  publicProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  },
  list(params: {
    role?: Role;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    search?: string;
    page: number;
    limit: number;
  }) {
    const { role, verificationStatus, search, page, limit } = params;
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { phone: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (verificationStatus) {
      where.workerProfile = { verificationStatus };
    }

    return prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          workerProfile: {
            select: {
              verificationStatus: true,
              cnicNumber: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
  },
};