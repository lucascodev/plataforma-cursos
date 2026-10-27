import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';
import { timestampSchema } from '../date/timestamp.schema.ts';
import { courseVersionSchema } from '../version/course-version.schema.ts';
import { smallCountSchema } from './small-count.schema.ts';

export const teacherCourseSchema = z.object({
  slug: courseSlugSchema,
  title: z.string().max(200),
  published: z.boolean(),
  listed: z.boolean(),
  publishedVersion: courseVersionSchema.nullable(),
  openVersion: courseVersionSchema.nullable(),
  studentCount: smallCountSchema,
  updatedAt: timestampSchema,
});

export type TeacherCourseRecord = z.infer<typeof teacherCourseSchema>;
