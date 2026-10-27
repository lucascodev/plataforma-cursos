import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';
import { courseVersionWithContentSchema } from '../version/course-version-with-content.schema.ts';
import { courseVersionSchema } from '../version/course-version.schema.ts';

export const courseWorkspaceSchema = z.object({
  course: z.object({ slug: courseSlugSchema, published: z.boolean(), listed: z.boolean() }),
  publishedVersion: courseVersionSchema.nullable(),
  openVersion: courseVersionWithContentSchema.nullable(),
});

export type CourseWorkspaceRecord = z.infer<typeof courseWorkspaceSchema>;
