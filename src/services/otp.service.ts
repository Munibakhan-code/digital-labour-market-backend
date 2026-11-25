import { logger } from '../config/logger';
import { generateOtp } from '../utils/otp';
import { env } from '../config/env';

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OtpRecord>();
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function key(phone: string) {
  return phone.trim();
}

export const otpService = {
  issue(phone: string): string {
    const otp = generateOtp(6);
    store.set(key(phone), {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });
    if (env.isProduction) {
      logger.info({ phone }, 'OTP issued (value hidden in production)');
    } else {
      logger.info({ phone, otp }, 'OTP issued (dev only)');
    }
    return otp;
  },
  verify(phone: string, otp: string): boolean {
    const record = store.get(key(phone));
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      store.delete(key(phone));
      return false;
    }
    record.attempts += 1;
    if (record.attempts > MAX_ATTEMPTS) {
      store.delete(key(phone));
      return false;
    }
    if (record.otp !== otp) return false;
    store.delete(key(phone));
    return true;
  },
};