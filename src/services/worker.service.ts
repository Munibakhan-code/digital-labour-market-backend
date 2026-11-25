import { workerRepository } from '../repositories/worker.repository';
import { ApiError } from '../utils/ApiError';
import { VerificationStatus } from '@prisma/client';

export const workerService = {
  async getMe(userId: string) {
    const profile = await workerRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Worker profile not found');
    return profile;
  },

  async updateMe(userId: string, data: {
    bio?: string;
    hourlyRate?: number;
    experienceYears?: number;
    isAvailable?: boolean;
    skills?: string[];
  }) {
    const profile = await workerRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Worker profile not found');

    const { skills, ...rest } = data;
    const updated = await workerRepository.update(profile.id, rest);
    if (skills) {
      await workerRepository.setSkills(profile.id, skills);
    }
    return workerRepository.findByUserId(userId);
  },

  async submitCnic(userId: string, cnicNumber: string, frontPath: string, backPath: string) {
    const profile = await workerRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Worker profile not found');

    return workerRepository.update(profile.id, {
      cnicNumber,
      cnicFrontPath: frontPath,
      cnicBackPath: backPath,
      submittedAt: new Date(),
    });
  },

  async submitVerification(userId: string) {
    const profile = await workerRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Worker profile not found');
    if (!profile.cnicNumber || !profile.cnicFrontPath || !profile.cnicBackPath) {
      throw ApiError.badRequest('CNIC details and documents are required');
    }
    if (profile.verificationStatus === 'approved') {
      throw ApiError.badRequest('Worker is already approved');
    }
    return workerRepository.update(profile.id, {
      verificationStatus: VerificationStatus.pending,
      submittedAt: new Date(),
      rejectionReason: null,
    });
  },

  async listPublic(params: { skill?: string; search?: string; page: number; limit: number }) {
    const [items, total] = await workerRepository.listPublic(params);
    return {
      items,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },

  async getPublicById(workerId: string) {
    const worker = await workerRepository.findById(workerId);
    if (!worker || worker.verificationStatus !== 'approved') {
      throw ApiError.notFound('Worker not found');
    }
    return {
      id: worker.id,
      bio: worker.bio,
      hourlyRate: worker.hourlyRate,
      experienceYears: worker.experienceYears,
      skills: worker.skills.map((s) => s.skill),
      user: worker.user,
    };
  },

  async listForVerification(params: { status?: VerificationStatus; page: number; limit: number }) {
    const [items, total] = await workerRepository.listForVerification(params);
    return {
      items,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    };
  },

  async getVerificationDetail(workerId: string) {
    const worker = await workerRepository.findById(workerId);
    if (!worker) throw ApiError.notFound('Worker not found');
    return worker;
  },

  async approve(workerId: string) {
    const worker = await workerRepository.findById(workerId);
    if (!worker) throw ApiError.notFound('Worker not found');
    return workerRepository.update(workerId, {
      verificationStatus: VerificationStatus.approved,
      approvedAt: new Date(),
      rejectionReason: null,
    });
  },

  async reject(workerId: string, reason: string) {
    const worker = await workerRepository.findById(workerId);
    if (!worker) throw ApiError.notFound('Worker not found');
    return workerRepository.update(workerId, {
      verificationStatus: VerificationStatus.rejected,
      rejectionReason: reason,
    });
  },
};