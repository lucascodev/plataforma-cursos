import type { UserRole } from '../types/user-role.type';

export interface AuthUser {
  readonly id: string;
  readonly handle: string;
  readonly role: UserRole;
  readonly displayName: string;
  readonly avatarUrl: string | null;
}
