import { z } from 'zod';
import { avatarUrlSchema } from '../url/avatar-url.schema.ts';
import { PROFILE_HANDLE_PATTERN } from '../profile/profile-handle-pattern.ts';

export const courseAuthorSchema = z.object({
  handle: z.string().regex(PROFILE_HANDLE_PATTERN),
  displayName: z.string().min(1).max(80),
  avatarUrl: avatarUrlSchema,
});

export type CourseAuthorRecord = z.infer<typeof courseAuthorSchema>;
