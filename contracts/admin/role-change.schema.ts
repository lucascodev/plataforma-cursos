import { z } from 'zod';
import { userRoleSchema } from '../profile/user-role.schema.ts';

export const roleChangeSchema = z.object({ role: userRoleSchema });

export type RoleChangeRecord = z.infer<typeof roleChangeSchema>;
