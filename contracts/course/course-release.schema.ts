import { z } from 'zod';
import { timestampSchema } from '../date/timestamp.schema.ts';
import { courseVersionKindSchema } from '../version/course-version-kind.schema.ts';
import { semverSchema } from '../version/semver.schema.ts';

export const courseReleaseSchema = z.object({
  semver: semverSchema,
  kind: courseVersionKindSchema.nullable(),
  releaseNote: z.string().max(2000).nullable(),
  publishedAt: timestampSchema.nullable(),
});

export type CourseReleaseRecord = z.infer<typeof courseReleaseSchema>;
