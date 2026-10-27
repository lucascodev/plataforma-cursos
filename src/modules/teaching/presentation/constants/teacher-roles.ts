import type { UserRole } from '@/modules/auth';

// Admins may also own and write courses.
export const TEACHER_ROLES: readonly UserRole[] = ['teacher', 'admin'];
