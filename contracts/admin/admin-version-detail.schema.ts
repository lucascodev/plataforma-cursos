import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';
import { profileCardSchema } from '../profile/profile-card.schema.ts';
import { courseDraftContentSchema } from '../version/course-draft-content.schema.ts';
import { courseVersionWithContentSchema } from '../version/course-version-with-content.schema.ts';

export const adminVersionDetailSchema = z.object({
  version: courseVersionWithContentSchema,
  course: z.object({
    slug: courseSlugSchema,
    title: z.string().max(200),
    published: z.boolean(),
    owner: profileCardSchema.nullable(),
    studentCount: z.number().int().min(0),
  }),
  publishedContent: courseDraftContentSchema.nullable(),
});

export type AdminVersionDetailRecord = z.infer<typeof adminVersionDetailSchema>;
