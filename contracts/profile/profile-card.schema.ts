import { z } from 'zod';
import { avatarUrlSchema } from '../url/avatar-url.schema';
import { PROFILE_HANDLE_PATTERN } from './profile-handle-pattern';
import { userRoleSchema } from './user-role.schema';

export const profileCardSchema = z.object({
  id: z.string().min(1).max(100),
  handle: z.string().regex(PROFILE_HANDLE_PATTERN),
  displayName: z.string().min(1).max(80),
  avatarUrl: avatarUrlSchema,
  role: userRoleSchema,
});

export type ProfileCardRecord = z.infer<typeof profileCardSchema>;
