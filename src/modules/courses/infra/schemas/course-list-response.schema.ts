import { courseAuthorSchema } from '@contracts/course/course-author.schema';
import { z } from 'zod';

export const courseListResponseSchema = z.object({
  courses: z.array(z.unknown()).max(200),
  authors: z.record(z.string(), courseAuthorSchema.nullable().catch(null)).catch({}).default({}),
});
