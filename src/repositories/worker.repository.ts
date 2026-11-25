import { prisma } from '../config/prisma';
import { VerificationStatus } from '@prisma/client';

export const workerRepository = {
  findByUserId(userId: string) {
    return prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, phone: true, fullName: true, email: true, role: true } },
        skills: true,
        wallet: true,
      },
    });
  },
  findById(id: string) {
    return prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, phone: true, fullName: true, role: true } },
        skills: true,
      },
    });
  },
  create(userId: string, data: { bio?: string; hourlyRate?: number; experienceYears?: number }) {
    return prisma.workerProfile.create({
      data: {
        userId,
        ...data,
      },
    });
  },
  update(workerId: string, data: Partial<{ bio: string; hourlyRate: number; experienceYears: number; isAvailable: boolean; cnicNumber: string; cnicFrontPath: string; cnicBackPath: string; verificationStatus: VerificationStatus; rejectionReason: string | null; submittedAt: Date; approvedAt: Date | null }>) {
    return prisma.workerProfile.update({ where: { id: workerId }, data });
  },
  setSkills(workerId: string, skills: string[]) {
    return prisma.$transaction(async (tx) => {
      await tx.workerSkill.deleteMany({ where: { workerId } });
      if (skills.length) {
        await tx.workerSkill.createMany({
          data: skills.map((s) => ({ workerId, skill: s })),
          skipDuplicates: true,
        });
      }
      return tx.workerProfile.findUnique({ where: { id: workerId }, include: { skills: true } });
    });
  },
  listPublic(params: { skill?: string; search?: string; page: number; limit: number }) {
    const { skill, search, page, limit } = params;
    const where: any = {
      verificationStatus: 'approved',
      isAvailable: true,
      user: { isActive: true },
    };
    if (skill) where.skills = { some: { skill } };
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.$transaction([
      prisma.workerProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          bio: true,
          hourlyRate: true,
          experienceYears: true,
          verificationStatus: true,
          isAvailable: true,
          createdAt: true,
          user: { select: { id: true, fullName: true } },
          skills: { select: { skill: true } },
        },
      }),
      prisma.workerProfile.count({ where }),
    ]);
  },
  listForVerification(params: { status?: VerificationStatus; page: number; limit: number }) {
    const where: any = {};
    if (params.status) where.verificationStatus = params.status;
    return prisma.$transaction([
      prisma.workerProfile.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, phone: true, fullName: true, email: true } },
          skills: true,
        },
      }),
      prisma.workerProfile.count({ where }),
    ]);
  },
};