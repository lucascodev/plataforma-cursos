import type { ProfileRole } from '../types/profile-role.type';
import type { ProfileLink } from './profile-link.entity';

export interface MyProfile {
  readonly id: string;
  readonly handle: string;
  readonly role: ProfileRole;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly bio: string;
  readonly links: readonly ProfileLink[];
  readonly showStudentCount: boolean;
  readonly createdAt: string;
}
