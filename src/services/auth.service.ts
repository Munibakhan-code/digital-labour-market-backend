import { prisma } from '../config/prisma';
import { userRepository } from '../repositories/user.repository';
import { workerRepository } from '../repositories/worker.repository';
import { otpService } from './otp.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { comparePassword } from '../utils/password';
import { logger } from '../config/logger';

function computeRefreshExpiry(): Date {
  // Parse "7d", "15m", "1h" etc.
  const raw = env.jwt.refreshExpiresIn;
  const match = /^(\d+)([smhd])$/.exec(raw);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const mult = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return new Date(Date.now() + value * mult);
}

async function persistRefreshToken(payload: { userId?: string; adminUserId?: string; token: string }) {
  return prisma.refreshToken.create({
    data: {
      token: payload.token,
      userId: payload.userId,
      adminUserId: payload.adminUserId,
      expiresAt: computeRefreshExpiry(),
    },
  });
}

export const authService = {
  requestOtp(phone: string, role: 'customer' | 'worker') {
    otpService.issue(phone);
    return { phone, role };
  },

  async verifyOtp(phone: string, otp: string, role: 'customer' | 'worker') {
    const valid = otpService.verify(phone, otp);
    if (!valid) throw ApiError.unauthorized('Invalid or expired OTP');

    let user = await userRepository.findByPhone(phone);
    if (!user) {
      user = await userRepository.create({ phone, role: role as Role });
      if (role === 'worker') {
        await workerRepository.create(user.id, {});
        await prisma.wallet.create({ data: { workerId: user.id } });
      }
    }

    // If existing user has different role and it's worker, ensure worker profile exists
    if (user.role === 'worker') {
      const profile = await workerRepository.findByUserId(user.id);
      if (!profile) {
        await workerRepository.create(user.id, {});
      }
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
    await persistRefreshToken({ userId: user.id, token: refreshToken });

    return { accessToken, refreshToken, user: { id: user.id, phone: user.phone, role: user.role } };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token revoked or expired');
    }

    // rotate
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    const newRefresh = signRefreshToken({ userId: payload.userId, role: payload.role });
    await persistRefreshToken({ userId: payload.userId, token: newRefresh });

    return { accessToken, refreshToken: newRefresh };
  },

  async logout(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (stored && !stored.revokedAt) {
      await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    }
    return { ok: true };
  },

  async me(userId: string) {
    const user = await userRepository.publicProfile(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async adminLogin(email: string, password: string) {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) throw ApiError.unauthorized('Invalid credentials');

    const ok = await comparePassword(password, admin.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');

    const accessToken = signAccessToken({ userId: admin.id, role: 'admin' });
    const refreshToken = signRefreshToken({ userId: admin.id, role: 'admin' });
    await persistRefreshToken({ adminUserId: admin.id, token: refreshToken });

    logger.info({ adminId: admin.id }, 'Admin logged in');
    return { accessToken, refreshToken, admin: { id: admin.id, email: admin.email } };
  },

  async adminRefresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token revoked or expired');
    }

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    const accessToken = signAccessToken({ userId: payload.userId, role: 'admin' });
    const newRefresh = signRefreshToken({ userId: payload.userId, role: 'admin' });
    await persistRefreshToken({ adminUserId: payload.userId, token: newRefresh });

    return { accessToken, refreshToken: newRefresh };
  },

  async adminLogout(refreshToken: string) {
    return this.logout(refreshToken);
  },

  async adminMe(userId: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true },
    });
    if (!admin) throw ApiError.notFound('Admin not found');
    return admin;
  },
};