import { z } from 'zod';

export const userRoleSchema = z.enum(['student', 'teacher', 'admin']);

export type UserRole = z.infer<typeof userRoleSchema>;
