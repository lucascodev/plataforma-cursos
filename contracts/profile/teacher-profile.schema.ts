import { z } from 'zod';
import { avatarUrlSchema } from '../url/avatar-url.schema.ts';
import { courseSlugSchema } from '../course/course-slug.schema.ts';
import { PROFILE_HANDLE_PATTERN } from './profile-handle-pattern.ts';
import { profileLinkSchema } from './profile-link.schema.ts';

export const teacherProfileSchema = z.object({
  handle: z.string().regex(PROFILE_HANDLE_PATTERN),
  displayName: z.string().min(1).max(80),
  avatarUrl: avatarUrlSchema,
  bio: z.string().max(1000),
  links: z.array(profileLinkSchema).max(5),
  courses: z.array(z.object({ slug: courseSlugSchema, title: z.string().max(200), tagline: z.string().max(400) })).max(200),
  studentCount: z.number().int().min(0).nullable(),
});

export type TeacherProfileRecord = z.infer<typeof teacherProfileSchema>;
