import { z } from 'zod';
import { avatarUrlSchema } from './avatar-url.schema';
import { PROFILE_HANDLE_PATTERN } from './profile-handle-pattern';
import { profileLinkSchema } from './profile-link.schema';
import { timestampSchema } from './timestamp.schema';
import { userRoleSchema } from './user-role.schema';

export const myProfileSchema = z.object({
  id: z.string().min(1).max(100),
  handle: z.string().regex(PROFILE_HANDLE_PATTERN),
  role: userRoleSchema,
  displayName: z.string().min(1).max(80),
  avatarUrl: avatarUrlSchema,
  bio: z.string().max(1000),
  links: z.array(profileLinkSchema).max(5),
  showStudentCount: z.boolean(),
  createdAt: timestampSchema,
});

export type MyProfileRecord = z.infer<typeof myProfileSchema>;
