import { z } from 'zod';
import { userRoleSchema } from './user-role.schema';

export const roleChangeSchema = z.object({ role: userRoleSchema });

export type RoleChangeRecord = z.infer<typeof roleChangeSchema>;
