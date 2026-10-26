import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';
import { profileCardSchema } from '../profile/profile-card.schema.ts';
import { timestampSchema } from '../date/timestamp.schema.ts';

export const adminCourseSchema = z.object({
  slug: courseSlugSchema,
  title: z.string().max(200),
  version: z.string().max(20).nullable(),
  published: z.boolean(),
  listed: z.boolean(),
  owner: profileCardSchema.nullable(),
  studentCount: z.number().int().min(0),
  updatedAt: timestampSchema,
});

export type AdminCourseRecord = z.infer<typeof adminCourseSchema>;
