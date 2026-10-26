import type { ProfileRole } from '../../domain/types/profile-role.type';

const ROLE_LABELS: Record<ProfileRole, string> = {
  student: 'Estudante',
  teacher: 'Professor',
  admin: 'Admin',
};

export function describeRole(role: ProfileRole): string {
  return ROLE_LABELS[role];
}
