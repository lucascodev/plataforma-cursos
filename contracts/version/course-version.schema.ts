import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';
import { timestampSchema } from '../date/timestamp.schema.ts';
import { courseVersionKindSchema } from './course-version-kind.schema.ts';
import { courseVersionStatusSchema } from './course-version-status.schema.ts';
import { reviewItemSchema } from './review-item.schema.ts';
import { semverSchema } from './semver.schema.ts';

export const courseVersionSchema = z.object({
  id: z.guid(),
  courseSlug: courseSlugSchema,
  status: courseVersionStatusSchema,
  semver: semverSchema.nullable(),
  kind: courseVersionKindSchema.nullable(),
  revision: z.number().int().min(1),
  submitMessage: z.string().max(1000).nullable(),
  reviewItems: z.array(reviewItemSchema).max(20),
  releaseNote: z.string().max(2000).nullable(),
  basedOnSemver: semverSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  submittedAt: timestampSchema.nullable(),
  reviewedAt: timestampSchema.nullable(),
  publishedAt: timestampSchema.nullable(),
});

export type CourseVersionRecord = z.infer<typeof courseVersionSchema>;
