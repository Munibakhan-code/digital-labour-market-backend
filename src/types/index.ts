export type Role = 'customer' | 'worker' | 'admin';

export interface AuthUser {
  userId: string;
  role: Role;
}