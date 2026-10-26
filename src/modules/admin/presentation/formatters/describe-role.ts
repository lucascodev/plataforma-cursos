import type { AdminRole } from '../../domain/types/admin-role.type';

export const ROLE_LABELS: Record<AdminRole, string> = {
  student: 'Estudante',
  teacher: 'Professor',
  admin: 'Admin',
};

export function describeRole(role: AdminRole): string {
  return ROLE_LABELS[role];
}
