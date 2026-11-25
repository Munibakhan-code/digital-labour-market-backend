import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';

export const userService = {
  async getMe(userId: string) {
    const user = await userRepository.publicProfile(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },
  async updateMe(userId: string, data: { fullName?: string; email?: string }) {
    return userRepository.update(userId, data);
  },
};