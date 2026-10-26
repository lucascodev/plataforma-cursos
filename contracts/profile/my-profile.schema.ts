import { z } from 'zod';
import { avatarUrlSchema } from '../url/avatar-url.schema.ts';
import { PROFILE_HANDLE_PATTERN } from './profile-handle-pattern.ts';
import { profileLinkSchema } from './profile-link.schema.ts';
import { timestampSchema } from '../date/timestamp.schema.ts';
import { userRoleSchema } from './user-role.schema.ts';

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
