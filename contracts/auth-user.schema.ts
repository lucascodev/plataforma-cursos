import { z } from 'zod';
import { avatarUrlSchema } from './avatar-url.schema';
import { PROFILE_HANDLE_PATTERN } from './profile-handle-pattern';
import { userRoleSchema } from './user-role.schema';

export const authUserSchema = z.object({
  id: z.string().min(1).max(100),
  handle: z.string().regex(PROFILE_HANDLE_PATTERN),
  role: userRoleSchema,
  displayName: z.string().min(1).max(80),
  avatarUrl: avatarUrlSchema,
});

export type AuthUserRecord = z.infer<typeof authUserSchema>;
