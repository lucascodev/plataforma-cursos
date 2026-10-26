import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema';
import { timestampSchema } from '../date/timestamp.schema';

const flags = z.record(z.string().max(80), z.literal(true));

export const progressSummarySchema = z.object({
  courseSlug: courseSlugSchema,
  updatedAt: timestampSchema,
  completedItems: flags.catch({}),
  studyDays: flags.catch({}),
});

export type ProgressSummaryRecord = z.infer<typeof progressSummarySchema>;
