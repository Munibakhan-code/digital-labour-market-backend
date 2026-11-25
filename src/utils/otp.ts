import crypto from 'crypto';

export function generateOtp(length = 6): string {
  const max = Math.pow(10, length);
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(length, '0');
}